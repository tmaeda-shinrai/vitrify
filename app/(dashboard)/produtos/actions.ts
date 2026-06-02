"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { serverEnv } from "@/lib/env";
import { OUTPUT_IMAGE_EXTENSION, type SignedUpload } from "@/lib/image";
import type { ProductListItem } from "@/lib/products";
import { checkProductWriteRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validators/product";

const PRODUCTS_BUCKET = "products";

export type ProductActionCode = "RATE_LIMIT" | "PLAN_LIMIT_REACHED" | "VALIDATION" | "ERROR";

export interface CreateProductResult {
  ok: boolean;
  error?: string;
  code?: ProductActionCode;
  product?: ProductListItem;
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

export async function createProductAction(input: unknown): Promise<CreateProductResult> {
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
  const { name, description, priceCents, imageUrl } = parsed.data;

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

  const { data: product, error: insertError } = await supabase
    .from("products")
    .insert({
      vitrine_id: vitrine.id,
      name,
      description: description ? description : null,
      price_cents: priceCents,
    })
    .select("id, name, price_cents, promo_price_cents, is_available")
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
    .insert({ product_id: product.id, url: imageUrl, display_order: 0 });

  if (imageError) {
    // Rollback best-effort: produto sem foto não deve existir nesta etapa.
    await supabase.from("products").delete().eq("id", product.id);
    return { ok: false, code: "ERROR", error: "Não foi possível salvar a foto. Tente novamente." };
  }

  revalidatePath(`/${vitrine.slug}`);

  return {
    ok: true,
    product: {
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      promo_price_cents: product.promo_price_cents,
      is_available: product.is_available ?? true,
      cover_url: imageUrl,
    },
  };
}
