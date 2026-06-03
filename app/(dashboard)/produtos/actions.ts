"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { serverEnv } from "@/lib/env";
import { OUTPUT_IMAGE_EXTENSION, type SignedUpload } from "@/lib/image";
import type { ProductListItem } from "@/lib/products";
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
 * Reconcilia `product_images` para a lista ordenada de URLs (índice 0 = capa):
 * mantém/insere/reordena as desejadas e remove (com limpeza no Storage) as que saíram.
 */
async function reconcileProductImages(
  supabase: SupabaseServer,
  productId: string,
  existing: { id: string; url: string }[],
  urls: string[],
): Promise<void> {
  for (let index = 0; index < urls.length; index++) {
    const url = urls[index]!;
    const row = existing.find((e) => e.url === url);
    if (row) {
      await supabase.from("product_images").update({ display_order: index }).eq("id", row.id);
    } else {
      await supabase
        .from("product_images")
        .insert({ product_id: productId, url, display_order: index });
    }
  }

  const removed = existing.filter((e) => !urls.includes(e.url));
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

  const { error: imageError } = await supabase
    .from("product_images")
    .insert(images.map((url, index) => ({ product_id: product.id, url, display_order: index })));

  if (imageError) {
    // Rollback best-effort: produto sem foto não deve existir nesta etapa.
    await supabase.from("products").delete().eq("id", product.id);
    const paths = images
      .map((url) => storagePathFromPublicUrl(url))
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
      cover_url: images[0] ?? null,
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
      cover_url: images[0] ?? null,
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
