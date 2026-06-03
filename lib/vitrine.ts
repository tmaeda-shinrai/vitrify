/**
 * Tipos e helpers puros da vitrine pública (#0012). Módulo sem diretiva e sem
 * dependências de servidor, para poder ser importado por componentes e testes
 * (espelha o padrão de `lib/products.ts`). A leitura no banco vive em
 * `lib/vitrine-data.ts`.
 */
import type { Metadata } from "next";

import { hexToHsl } from "@/lib/color";
import type { ProductListItem } from "@/lib/products";

export type ThemeMode = "light" | "dark" | "auto";

/** Campos públicos da dona, lidos via service role (ver `lib/supabase/admin`). */
export interface PublicOwner {
  fullName: string;
  bio: string | null;
  avatarUrl: string | null;
  whatsapp: string | null;
}

export interface PublicVitrine {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  heroImageUrl: string | null;
  themeMode: ThemeMode;
  themePrimary: string | null;
  owner: PublicOwner;
  products: ProductListItem[];
}

const DEFAULT_THEME_PRIMARY = "#7C3AED";
const PLACEHOLDER_TITLE = "minha vitrine";

/** Heading do header: o título da vitrine, com fallback para o nome da dona. */
export function vitrineTitle(input: { title: string | null; ownerName: string | null }): string {
  const title = input.title?.trim() ?? "";
  if (title && title.toLowerCase() !== PLACEHOLDER_TITLE) return title;
  return input.ownerName?.trim() || title || "Vitrine";
}

/** Marcas distintas (ordem de aparição) — usado no SEO/descrição (PR2). */
export function distinctBrands(products: { brand_name: string | null }[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const product of products) {
    const brand = product.brand_name?.trim();
    if (brand && !seen.has(brand.toLowerCase())) {
      seen.add(brand.toLowerCase());
      result.push(brand);
    }
  }
  return result;
}

/** `5511999998888` → `(11) 99999-8888`. Devolve o original se não casar o padrão BR. */
export function formatWhatsappDisplay(value: string | null): string | null {
  if (!value) return null;
  const match = /^55(\d{2})(\d{5})(\d{4})$/.exec(value.replace(/\D/g, ""));
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : value;
}

/** Classe de tema do container da vitrine (Tailwind `darkMode: ["class"]`). */
export function themeModeClass(mode: ThemeMode): string {
  if (mode === "dark") return "dark";
  if (mode === "auto") return "theme-auto";
  return "";
}

/**
 * CSS vars da cor primária livre da vitrine. Vazio quando ausente ou igual ao
 * default (no MVP o default basta; picker livre é Pro+, futuro).
 */
export function themePrimaryVars(hex: string | null | undefined): Record<string, string> {
  if (!hex || hex.toLowerCase() === DEFAULT_THEME_PRIMARY.toLowerCase()) return {};
  const hsl = hexToHsl(hex);
  return hsl ? { "--primary": hsl, "--ring": hsl } : {};
}

function vitrineUrl(appUrl: string, slug: string): string {
  return `${appUrl.replace(/\/$/, "")}/${slug}`;
}

/** Metadata (title/description/OG/Twitter) da vitrine pública (SEO, GTM §3.2). */
export function buildVitrineMetadata(vitrine: PublicVitrine, appUrl: string): Metadata {
  const name = vitrineTitle({ title: vitrine.title, ownerName: vitrine.owner.fullName });
  const brands = distinctBrands(vitrine.products);
  const brandsText = brands.join(", ");
  const title = brandsText ? `Vitrine de ${name} — ${brandsText}` : `Vitrine de ${name}`;
  const bio = vitrine.owner.bio?.trim();
  const description =
    [bio, brandsText && `Produtos: ${brandsText}.`].filter(Boolean).join(" ") ||
    `Confira a vitrine de ${name}.`;
  const url = vitrineUrl(appUrl, vitrine.slug);
  const image = vitrine.heroImageUrl ?? vitrine.owner.avatarUrl ?? undefined;
  const images = image ? [image] : undefined;

  return {
    metadataBase: new URL(appUrl),
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

/** JSON-LD Schema.org da vitrine: ProfilePage (Person) + ItemList de Product. */
export function buildVitrineJsonLd(
  vitrine: PublicVitrine,
  appUrl: string,
): Record<string, unknown> {
  const name = vitrineTitle({ title: vitrine.title, ownerName: vitrine.owner.fullName });

  const itemListElement = vitrine.products.map((product, index) => ({
    "@type": "Product",
    position: index + 1,
    name: product.name,
    ...(product.cover_url ? { image: product.cover_url } : {}),
    ...(product.description ? { description: product.description } : {}),
    offers: {
      "@type": "Offer",
      price: ((product.promo_price_cents ?? product.price_cents) / 100).toFixed(2),
      priceCurrency: "BRL",
      availability: product.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: vitrineUrl(appUrl, vitrine.slug),
    mainEntity: {
      "@type": "Person",
      name,
      ...(vitrine.owner.avatarUrl ? { image: vitrine.owner.avatarUrl } : {}),
      ...(vitrine.owner.bio ? { description: vitrine.owner.bio } : {}),
    },
    hasPart: { "@type": "ItemList", itemListElement },
  };
}
