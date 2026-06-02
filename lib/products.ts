/**
 * Tipos e helpers de produto compartilhados entre Server Components, Server Actions
 * e hooks de cliente. Módulo puro (sem diretiva) para poder ser importado dos dois
 * lados sem virar uma client reference.
 */

export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  promo_price_cents: number | null;
  is_available: boolean;
  cover_url: string | null;
}

/** Colunas explícitas da listagem (CONTRIBUTING: nunca `SELECT *`). */
export const PRODUCT_LIST_SELECT =
  "id, name, description, price_cents, promo_price_cents, is_available, created_at, product_images(url, display_order)";

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  promo_price_cents: number | null;
  is_available: boolean | null;
  product_images: { url: string; display_order: number | null }[];
}

/** Normaliza uma linha de `products` (com imagens) para o item de listagem + capa. */
export function toProductListItem(row: ProductRow): ProductListItem {
  const cover = [...row.product_images].sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  )[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price_cents: row.price_cents,
    promo_price_cents: row.promo_price_cents,
    is_available: row.is_available ?? true,
    cover_url: cover?.url ?? null,
  };
}
