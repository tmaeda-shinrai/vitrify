"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { serverEnv } from "@/lib/env";
import { OUTPUT_IMAGE_EXTENSION, type SignedUpload } from "@/lib/image";
import type { ProductImage, ProductListItem } from "@/lib/products";
import { checkProductWriteRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validators/product";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

const PRODUCTS_BUCKET = "products";

export type ProductActionCode = "RATE_LIMIT" | "PLAN_LIMIT_REACHED" | "VALIDATION" | "ERROR";

export interface ProductMutationResult {
  ok: boolean;
  error?: string;
  code?: ProductActionCode;
  product?: ProductListItem;
}

interface ResolvedRefs {
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
}

/** Extrai o path do objeto a partir da URL pública (`…/object/public/products/<path>`). */
function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/object/public/products/";
  const i = url.indexOf(marker);
  return i === -1 ? null : url.slice(i + marker.length);
}

/**
 * Resolve categoria (confere posse pela vitrine) e marca (find-or-create por nome,
 * único por vitrine). Devolve ids + nomes para refletir na listagem.
 */
async function resolveCategoryAndBrand(
  supabase: SupabaseServer,
  vitrineId: string,
  categoryId: string | null | undefined,
  brandNameRaw: string | undefined,
): Promise<ResolvedRefs> {
  const refs: ResolvedRefs = {
    categoryId: null,
    categoryName: null,
    brandId: null,
    brandName: null,
  };

  if (categoryId) {
    const { data } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", categoryId)
      .eq("vitrine_id", vitrineId)
      .maybeSingle();
    if (data) {
      refs.categoryId = data.id;
      refs.categoryName = data.name;
    }
  }

  const name = brandNameRaw?.trim() ?? "";
  if (name) {
    const { data: existing } = await supabase
      .from("brands")
      .select("id, name")
      .eq("vitrine_id", vitrineId)
      .eq("name", name)
      .maybeSingle();
    if (existing) {
      refs.brandId = existing.id;
      refs.brandName = existing.name;
    } else {
      const { data: created, error } = await supabase
        .from("brands")
        .insert({ vitrine_id: vitrineId, name })
        .select("id, name")
        .single();
      if (created) {
        refs.brandId = created.id;
        refs.brandName = created.name;
      } else if (error?.code === "23505") {
        // Corrida: outra requisição criou a marca — re-seleciona.
        const { data: again } = await supabase
          .from("brands")
          .select("id, name")
          .eq("vitrine_id", vitrineId)
          .eq("name", name)
          .maybeSingle();
        if (again) {
          refs.brandId = again.id;
          refs.brandName = again.name;
        }
      }
    }
  }

  return refs;
}

/**
 * Reconcilia `product_images` para a lista ordenada de fotos (índice 0 = capa):
 * mantém/insere/reordena as desejadas (gravando o `alt_text`) e remove (com limpeza
 * no Storage) as que saíram. `alt` vazio vira NULL (a leitura aplica o fallback).
 */
async function reconcileProductImages(
  supabase: SupabaseServer,
  productId: string,
  existing: { id: string; url: string }[],
  images: ProductImage[],
): Promise<void> {
  for (let index = 0; index < images.length; index++) {
    const { url, alt } = images[index]!;
    const altText = alt ? alt : null;
    const row = existing.find((e) => e.url === url);
    if (row) {
      await supabase
        .from("product_images")
        .update({ display_order: index, alt_text: altText })
        .eq("id", row.id);
    } else {
      await supabase
        .from("product_images")
        .insert({ product_id: productId, url, display_order: index, alt_text: altText });
    }
  }

  const desiredUrls = new Set(images.map((img) => img.url));
  const removed = existing.filter((e) => !desiredUrls.has(e.url));
  if (removed.length) {
    await supabase
      .from("product_images")
      .delete()
      .in(
        "id",
        removed.map((r) => r.id),
      );
    const paths = removed
      .map((r) => storagePathFromPublicUrl(r.url))
      .filter((p): p is string => p !== null);
    if (paths.length) await supabase.storage.from(PRODUCTS_BUCKET).remove(paths);
  }
}

/** Assina o upload da foto do produto (sempre .webp) na pasta da dona. */
export async function createProductImageUploadUrl(): Promise<SignedUpload> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada. Entre novamente." };

  const path = `${user.id}/${randomUUID()}.${OUTPUT_IMAGE_EXTENSION}`;
  const { data, error } = await supabase.storage.from(PRODUCTS_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "Não foi possível iniciar o upload." };

  const {
    data: { publicUrl },
  } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(path);

  return { ok: true, path: data.path, token: data.token, publicUrl };
}

export async function createProductAction(input: unknown): Promise<ProductMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "ERROR", error: "Sessão expirada. Entre novamente." };

  // Rate limit por usuária (30/min) — ARCHITECTURE §6.4.
  const rate = await checkProductWriteRateLimit(user.id);
  if (!rate.success) {
    return { ok: false, code: "RATE_LIMIT", error: "Muitas requisições. Aguarde um instante." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  const {
    name,
    description,
    priceCents,
    promoPriceCents,
    isAvailable,
    categoryId,
    brandName,
    images,
  } = parsed.data;

  const [{ data: vitrine }, { data: subscription }] = await Promise.all([
    supabase
      .from("vitrines")
      .select("id, slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase.from("subscriptions").select("plan").eq("owner_id", user.id).maybeSingle(),
  ]);
  if (!vitrine) return { ok: false, code: "ERROR", error: "Vitrine não encontrada." };

  // Pré-checagem do limite na aplicação (o trigger check_product_limit é o backstop).
  if (subscription?.plan === "free") {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("vitrine_id", vitrine.id)
      .eq("is_active", true);
    if ((count ?? 0) >= serverEnv.LIMIT_FREE_PRODUCTS) {
      return { ok: false, code: "PLAN_LIMIT_REACHED" };
    }
  }

  const refs = await resolveCategoryAndBrand(supabase, vitrine.id, categoryId, brandName);

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      vitrine_id: vitrine.id,
      name,
      description: description ? description : null,
      price_cents: priceCents,
      promo_price_cents: promoPriceCents ?? null,
      is_available: isAvailable,
      category_id: refs.categoryId,
      brand_id: refs.brandId,
    })
    .select("id, name, description, price_cents, promo_price_cents, is_available")
    .single();

  if (insertError || !product) {
    // Backstop: o trigger lança PLAN_LIMIT_REACHED se a pré-checagem passou batido.
    if (insertError?.message?.includes("PLAN_LIMIT_REACHED")) {
      return { ok: false, code: "PLAN_LIMIT_REACHED" };
    }
    return {
      ok: false,
      code: "ERROR",
      error: "Não foi possível salvar o produto. Tente novamente.",
    };
  }

  const { error: imageError } = await supabase.from("product_images").insert(
    images.map((img, index) => ({
      product_id: product.id,
      url: img.url,
      display_order: index,
      alt_text: img.alt ? img.alt : null,
    })),
  );

  if (imageError) {
    // Rollback best-effort: produto sem foto não deve existir nesta etapa.
    await supabase.from("products").delete().eq("id", product.id);
    const paths = images
      .map((img) => storagePathFromPublicUrl(img.url))
      .filter((p): p is string => p !== null);
    if (paths.length) await supabase.storage.from(PRODUCTS_BUCKET).remove(paths);
    return {
      ok: false,
      code: "ERROR",
      error: "Não foi possível salvar as fotos. Tente novamente.",
    };
  }

  revalidatePath(`/${vitrine.slug}`);

  return {
    ok: true,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price_cents: product.price_cents,
      promo_price_cents: product.promo_price_cents,
      is_available: product.is_available ?? true,
      category_id: refs.categoryId,
      category_name: refs.categoryName,
      brand_id: refs.brandId,
      brand_name: refs.brandName,
      images,
      cover_url: images[0]?.url ?? null,
    },
  };
}

export async function updateProductAction(
  productId: string,
  input: unknown,
): Promise<ProductMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "ERROR", error: "Sessão expirada. Entre novamente." };

  const rate = await checkProductWriteRateLimit(user.id);
  if (!rate.success) {
    return { ok: false, code: "RATE_LIMIT", error: "Muitas requisições. Aguarde um instante." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: "VALIDATION",
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  const {
    name,
    description,
    priceCents,
    promoPriceCents,
    isAvailable,
    categoryId,
    brandName,
    images,
  } = parsed.data;

  // RLS garante posse; a vitrine padrão dá o id (categoria/marca) e o slug (revalidate).
  const [{ data: existing }, { data: vitrine }, { data: existingImages }] = await Promise.all([
    supabase.from("products").select("id").eq("id", productId).maybeSingle(),
    supabase
      .from("vitrines")
      .select("id, slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase.from("product_images").select("id, url").eq("product_id", productId),
  ]);
  if (!existing || !vitrine) return { ok: false, code: "ERROR", error: "Produto não encontrado." };

  const refs = await resolveCategoryAndBrand(supabase, vitrine.id, categoryId, brandName);

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name,
      description: description ? description : null,
      price_cents: priceCents,
      promo_price_cents: promoPriceCents ?? null,
      is_available: isAvailable,
      category_id: refs.categoryId,
      brand_id: refs.brandId,
    })
    .eq("id", productId);
  if (updateError) {
    return { ok: false, code: "ERROR", error: "Não foi possível salvar. Tente novamente." };
  }

  await reconcileProductImages(supabase, productId, existingImages ?? [], images);

  revalidatePath(`/${vitrine.slug}`);

  return {
    ok: true,
    product: {
      id: productId,
      name,
      description: description ? description : null,
      price_cents: priceCents,
      promo_price_cents: promoPriceCents ?? null,
      is_available: isAvailable,
      category_id: refs.categoryId,
      category_name: refs.categoryName,
      brand_id: refs.brandId,
      brand_name: refs.brandName,
      images,
      cover_url: images[0]?.url ?? null,
    },
  };
}

export async function deleteProductAction(productId: string): Promise<ProductMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "ERROR", error: "Sessão expirada. Entre novamente." };

  const [{ data: images }, { data: vitrine }] = await Promise.all([
    supabase.from("product_images").select("url").eq("product_id", productId),
    supabase
      .from("vitrines")
      .select("slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
  ]);

  // RLS restringe a exclusão aos produtos da dona; o cascade apaga product_images.
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error)
    return { ok: false, code: "ERROR", error: "Não foi possível excluir. Tente novamente." };

  // Limpeza best-effort dos objetos no Storage.
  const paths = (images ?? [])
    .map((img) => storagePathFromPublicUrl(img.url))
    .filter((p): p is string => p !== null);
  if (paths.length) await supabase.storage.from(PRODUCTS_BUCKET).remove(paths);

  if (vitrine?.slug) revalidatePath(`/${vitrine.slug}`);

  return { ok: true };
}

export async function reorderProductsAction(orderedIds: string[]): Promise<ProductMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "ERROR", error: "Sessão expirada. Entre novamente." };

  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("slug")
    .eq("owner_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  // display_order = índice na lista. RLS restringe aos produtos da dona.
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("products").update({ display_order: index }).eq("id", id),
    ),
  );

  if (vitrine?.slug) revalidatePath(`/${vitrine.slug}`);
  return { ok: true };
}

export async function duplicateProductAction(productId: string): Promise<ProductMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "ERROR", error: "Sessão expirada. Entre novamente." };

  const rate = await checkProductWriteRateLimit(user.id);
  if (!rate.success) {
    return { ok: false, code: "RATE_LIMIT", error: "Muitas requisições. Aguarde um instante." };
  }

  // Original (RLS restringe à dona) com nomes de categoria/marca.
  const { data: original } = await supabase
    .from("products")
    .select(
      "name, description, price_cents, promo_price_cents, is_available, category_id, brand_id, categories(name), brands(name)",
    )
    .eq("id", productId)
    .maybeSingle();
  if (!original) return { ok: false, code: "ERROR", error: "Produto não encontrado." };

  const [{ data: vitrine }, { data: subscription }, { data: originalImages }] = await Promise.all([
    supabase
      .from("vitrines")
      .select("id, slug")
      .eq("owner_id", user.id)
      .eq("is_default", true)
      .maybeSingle(),
    supabase.from("subscriptions").select("plan").eq("owner_id", user.id).maybeSingle(),
    supabase
      .from("product_images")
      .select("url, alt_text, display_order")
      .eq("product_id", productId)
      .order("display_order", { ascending: true }),
  ]);
  if (!vitrine) return { ok: false, code: "ERROR", error: "Vitrine não encontrada." };

  if (subscription?.plan === "free") {
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("vitrine_id", vitrine.id)
      .eq("is_active", true);
    if ((count ?? 0) >= serverEnv.LIMIT_FREE_PRODUCTS) {
      return { ok: false, code: "PLAN_LIMIT_REACHED" };
    }
  }

  const copyName = `${original.name} (cópia)`.slice(0, 120);

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      vitrine_id: vitrine.id,
      name: copyName,
      description: original.description,
      price_cents: original.price_cents,
      promo_price_cents: original.promo_price_cents,
      is_available: original.is_available,
      category_id: original.category_id,
      brand_id: original.brand_id,
      display_order: 0,
    })
    .select("id, name, description, price_cents, promo_price_cents, is_available")
    .single();
  if (insertError || !product) {
    if (insertError?.message?.includes("PLAN_LIMIT_REACHED")) {
      return { ok: false, code: "PLAN_LIMIT_REACHED" };
    }
    return {
      ok: false,
      code: "ERROR",
      error: "Não foi possível duplicar o produto. Tente novamente.",
    };
  }

  // Copia cada imagem no Storage (objetos próprios); fallback p/ a URL original.
  // Preserva o texto alternativo (alt_text) da foto original.
  const newImages: ProductImage[] = [];
  for (const img of originalImages ?? []) {
    let url = img.url;
    const fromPath = storagePathFromPublicUrl(img.url);
    if (fromPath) {
      const toPath = `${user.id}/${randomUUID()}.${OUTPUT_IMAGE_EXTENSION}`;
      const { error: copyError } = await supabase.storage
        .from(PRODUCTS_BUCKET)
        .copy(fromPath, toPath);
      if (!copyError) {
        url = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(toPath).data.publicUrl;
      }
    }
    newImages.push({ url, alt: img.alt_text ?? "" });
  }
  if (newImages.length) {
    await supabase.from("product_images").insert(
      newImages.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        display_order: index,
        alt_text: img.alt ? img.alt : null,
      })),
    );
  }

  revalidatePath(`/${vitrine.slug}`);

  return {
    ok: true,
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price_cents: product.price_cents,
      promo_price_cents: product.promo_price_cents,
      is_available: product.is_available ?? true,
      category_id: original.category_id,
      category_name: original.categories?.name ?? null,
      brand_id: original.brand_id,
      brand_name: original.brands?.name ?? null,
      images: newImages,
      cover_url: newImages[0]?.url ?? null,
    },
  };
}
