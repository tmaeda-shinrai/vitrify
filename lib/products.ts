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
  category_id: string | null;
  category_name: string | null;
  brand_id: string | null;
  brand_name: string | null;
  /** URLs das fotos, ordenadas (índice 0 = capa). */
  images: string[];
  cover_url: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  display_order: number;
}

export interface BrandItem {
  id: string;
  name: string;
}

/** Colunas explícitas da listagem (CONTRIBUTING: nunca `SELECT *`). */
export const PRODUCT_LIST_SELECT =
  "id, name, description, price_cents, promo_price_cents, is_available, category_id, brand_id, created_at, categories(name), brands(name), product_images(url, display_order)";

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  promo_price_cents: number | null;
  is_available: boolean | null;
  category_id: string | null;
  brand_id: string | null;
  categories: { name: string } | null;
  brands: { name: string } | null;
  product_images: { url: string; display_order: number | null }[];
}

/** Move o item `activeId` para a posição do item `overId` (reordenação por drag). */
export function moveById<T extends { id: string }>(
  items: T[],
  activeId: string,
  overId: string,
): T[] {
  const from = items.findIndex((i) => i.id === activeId);
  const to = items.findIndex((i) => i.id === overId);
  if (from === -1 || to === -1 || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved!);
  return next;
}

/** Normaliza uma linha de `products` (com imagens) para o item de listagem. */
export function toProductListItem(row: ProductRow): ProductListItem {
  const images = [...row.product_images]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img) => img.url);
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price_cents: row.price_cents,
    promo_price_cents: row.promo_price_cents,
    is_available: row.is_available ?? true,
    category_id: row.category_id,
    category_name: row.categories?.name ?? null,
    brand_id: row.brand_id,
    brand_name: row.brands?.name ?? null,
    images,
    cover_url: images[0] ?? null,
  };
}
