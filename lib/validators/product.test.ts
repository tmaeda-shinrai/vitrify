import { describe, expect, it } from "vitest";

import { PRODUCT_DESC_MAX, PRODUCT_NAME_MAX, productSchema } from "@/lib/validators/product";

const valid = {
  name: "Batom Matte Vermelho",
  description: "Longa duração, cor intensa.",
  priceCents: 3290,
  imageUrl: "https://proj.supabase.co/storage/v1/object/public/products/u/x.webp",
};

describe("productSchema", () => {
  it("aceita um produto válido", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
  });

  it("aceita descrição vazia ou ausente", () => {
    expect(productSchema.safeParse({ ...valid, description: "" }).success).toBe(true);
    expect(
      productSchema.safeParse({
        name: valid.name,
        priceCents: valid.priceCents,
        imageUrl: valid.imageUrl,
      }).success,
    ).toBe(true);
  });

  it("barra nome muito curto ou acima do limite", () => {
    expect(productSchema.safeParse({ ...valid, name: "x" }).success).toBe(false);
    expect(
      productSchema.safeParse({ ...valid, name: "a".repeat(PRODUCT_NAME_MAX + 1) }).success,
    ).toBe(false);
  });

  it("barra preço negativo", () => {
    expect(productSchema.safeParse({ ...valid, priceCents: -100 }).success).toBe(false);
  });

  it("barra descrição acima do limite", () => {
    expect(
      productSchema.safeParse({ ...valid, description: "a".repeat(PRODUCT_DESC_MAX + 1) }).success,
    ).toBe(false);
  });

  it("exige uma foto (imageUrl válida)", () => {
    expect(productSchema.safeParse({ ...valid, imageUrl: "" }).success).toBe(false);
    expect(
      productSchema.safeParse({
        name: valid.name,
        priceCents: valid.priceCents,
      }).success,
    ).toBe(false);
  });
});
