import { describe, expect, it } from "vitest";

import type { ProductListItem } from "@/lib/products";
import { brandOptions, categoryOptions, filterProducts, normalize } from "@/lib/search";

function make(over: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: "p1",
    name: "Produto",
    description: null,
    price_cents: 1000,
    promo_price_cents: null,
    is_available: true,
    category_id: null,
    category_name: null,
    brand_id: null,
    brand_name: null,
    images: [],
    cover_url: null,
    ...over,
  };
}

const products: ProductListItem[] = [
  make({
    id: "a",
    name: "Perfume Floral",
    category_id: "c1",
    category_name: "Perfumaria",
    brand_id: "b1",
    brand_name: "Natura",
  }),
  make({
    id: "b",
    name: "Batom",
    description: "Tom pêssego",
    category_id: "c2",
    category_name: "Maquiagem",
    brand_id: "b2",
    brand_name: "Avon",
  }),
  make({
    id: "c",
    name: "Creme",
    category_id: "c1",
    category_name: "Perfumaria",
    brand_id: "b2",
    brand_name: "Avon",
  }),
];

describe("normalize", () => {
  it("remove acento e baixa caixa", () => {
    expect(normalize("Pêssego")).toBe("pessego");
    expect(normalize("  PERFUME ")).toBe("perfume");
  });
});

describe("filterProducts", () => {
  it("busca acento-insensível em nome e descrição", () => {
    expect(filterProducts(products, { query: "perfume" }).map((p) => p.id)).toEqual(["a"]);
    expect(filterProducts(products, { query: "pessego" }).map((p) => p.id)).toEqual(["b"]);
  });

  it("filtra por categoria e por marca, combinando", () => {
    expect(filterProducts(products, { categoryId: "c1" }).map((p) => p.id)).toEqual(["a", "c"]);
    expect(filterProducts(products, { brandId: "b2" }).map((p) => p.id)).toEqual(["b", "c"]);
    expect(filterProducts(products, { categoryId: "c1", brandId: "b2" }).map((p) => p.id)).toEqual([
      "c",
    ]);
  });
});

describe("categoryOptions / brandOptions", () => {
  it("retorna opções distintas ordenadas por nome", () => {
    expect(categoryOptions(products)).toEqual([
      { id: "c2", name: "Maquiagem" },
      { id: "c1", name: "Perfumaria" },
    ]);
    expect(brandOptions(products)).toEqual([
      { id: "b2", name: "Avon" },
      { id: "b1", name: "Natura" },
    ]);
  });
});
