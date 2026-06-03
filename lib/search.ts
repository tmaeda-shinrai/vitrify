/**
 * Busca e filtro client-side da vitrine pública (#0014). Helpers puros sobre os
 * produtos já carregados (a rota é ISR; não lemos `searchParams` no server). Busca
 * tolerante a acento via `normalize`. Para catálogos grandes, o full-text do
 * Postgres (`products.search_text`) é a otimização futura (DATABASE §8).
 */
import type { ProductListItem } from "@/lib/products";

export interface FilterOption {
  id: string;
  name: string;
}

export interface ProductFilters {
  query?: string;
  categoryId?: string | null;
  brandId?: string | null;
}

/** minúsculas + sem acento (NFD) — para busca/comparação tolerante a acento. */
export function normalize(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Filtra por categoria E marca E texto (nome + descrição), acento-insensível. */
export function filterProducts(
  products: ProductListItem[],
  { query, categoryId, brandId }: ProductFilters,
): ProductListItem[] {
  const q = query ? normalize(query) : "";
  return products.filter((product) => {
    if (categoryId && product.category_id !== categoryId) return false;
    if (brandId && product.brand_id !== brandId) return false;
    if (q && !normalize(`${product.name} ${product.description ?? ""}`).includes(q)) return false;
    return true;
  });
}

function distinctBy(
  products: ProductListItem[],
  idKey: "category_id" | "brand_id",
  nameKey: "category_name" | "brand_name",
): FilterOption[] {
  const map = new Map<string, string>();
  for (const product of products) {
    const id = product[idKey];
    const name = product[nameKey];
    if (id && name && !map.has(id)) map.set(id, name);
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

/** Categorias distintas (id+nome) presentes nos produtos, ordenadas pt-BR. */
export function categoryOptions(products: ProductListItem[]): FilterOption[] {
  return distinctBy(products, "category_id", "category_name");
}

/** Marcas distintas (id+nome) presentes nos produtos, ordenadas pt-BR. */
export function brandOptions(products: ProductListItem[]): FilterOption[] {
  return distinctBy(products, "brand_id", "brand_name");
}
