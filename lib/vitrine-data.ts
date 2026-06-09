/**
 * Leitura da vitrine pública (#0012) — server-only. Combina a leitura pública
 * (anon, respeita RLS de itens ativos) com o perfil da dona via service role
 * (`profiles` não tem RLS pública). Ambos os clients são sem cookies, então a
 * rota da vitrine continua elegível a ISR. Os helpers puros ficam em `lib/vitrine`.
 */
import { cache } from "react";

import { effectiveProductLimit } from "@/lib/billing/limits";
import { serverEnv } from "@/lib/env";
import { PRODUCT_LIST_SELECT, toProductListItem } from "@/lib/products";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import type { PublicOwner, PublicVitrine, ThemeMode } from "@/lib/vitrine";

/** Teto defensivo: vitrines têm poucos produtos; evita varrer demais. */
const PRODUCT_LIMIT = 200;

/**
 * Slugs de todas as vitrines ativas — usado por `generateStaticParams` (prebuild
 * + ISR) e pelo `sitemap.xml` (PR2). Leitura pública (anon, RLS).
 */
export async function getActiveVitrineSlugs(limit = 1000): Promise<string[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("vitrines")
    .select("slug")
    .eq("is_active", true)
    .limit(limit);
  return (data ?? []).map((vitrine) => vitrine.slug);
}

/**
 * Estado de moderação de um slug (#0023) — só consultado no caminho not-found do
 * público, para distinguir "bloqueada" (mensagem neutra) de "inexistente" (404).
 * Service role: a policy pública esconde vitrines bloqueadas, então o anon não as vê.
 */
export async function getVitrineModerationState(
  slug: string,
): Promise<"ok" | "blocked" | "missing"> {
  const admin = createAdminClient();
  const { data } = await admin.from("vitrines").select("blocked_at").eq("slug", slug).maybeSingle();
  if (!data) return "missing";
  return data.blocked_at ? "blocked" : "ok";
}

function normalizeThemeMode(mode: string | null): ThemeMode {
  return mode === "light" || mode === "dark" ? mode : "auto";
}

async function fetchPublicOwner(ownerId: string): Promise<PublicOwner> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("full_name, bio, avatar_url, whatsapp, is_ambassador")
    .eq("id", ownerId)
    .maybeSingle();

  return {
    fullName: data?.full_name ?? "",
    bio: data?.bio ?? null,
    avatarUrl: data?.avatar_url ?? null,
    whatsapp: data?.whatsapp ?? null,
    isAmbassador: data?.is_ambassador ?? false,
  };
}

/**
 * Limite efetivo de produtos da vitrine conforme o plano/estado da dona (#0019):
 * Free ou inadimplente há ≥14 dias mostra só o limite Free (esconde o excedente).
 * `null` = sem limite. Lê a assinatura via service role (sem RLS pública).
 */
async function fetchOwnerProductLimit(ownerId: string): Promise<number | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("plan, past_due_since")
    .eq("owner_id", ownerId)
    .maybeSingle();
  return effectiveProductLimit(
    data?.plan ?? "free",
    data?.past_due_since ?? null,
    serverEnv.LIMIT_FREE_PRODUCTS,
  );
}

/**
 * Busca a vitrine ativa por slug com seus produtos ativos e o contato da dona.
 * Retorna `null` se o slug não existir ou a vitrine estiver inativa.
 *
 * Envolto em `cache()` do React para deduplicar a leitura entre `generateMetadata`
 * e o componente da página dentro da mesma request.
 */
export const getPublicVitrine = cache(async (slug: string): Promise<PublicVitrine | null> => {
  const supabase = createPublicClient();

  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("id, slug, title, subtitle, hero_image_url, theme_mode, theme_primary, owner_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!vitrine) return null;

  const [{ data: productRows }, owner, productLimit] = await Promise.all([
    supabase
      .from("products")
      .select(PRODUCT_LIST_SELECT)
      .eq("vitrine_id", vitrine.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(PRODUCT_LIMIT),
    fetchPublicOwner(vitrine.owner_id),
    fetchOwnerProductLimit(vitrine.owner_id),
  ]);

  // Inadimplência/Free: esconde o excedente (mantém a ordem; nunca apaga).
  const allProducts = (productRows ?? []).map(toProductListItem);
  const products = productLimit !== null ? allProducts.slice(0, productLimit) : allProducts;

  return {
    id: vitrine.id,
    slug: vitrine.slug,
    title: vitrine.title,
    subtitle: vitrine.subtitle,
    heroImageUrl: vitrine.hero_image_url,
    themeMode: normalizeThemeMode(vitrine.theme_mode),
    themePrimary: vitrine.theme_primary,
    owner,
    products,
  };
});
