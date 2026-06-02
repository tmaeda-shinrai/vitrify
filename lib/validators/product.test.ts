import { describe, expect, it } from "vitest";

import {
  PRODUCT_DESC_MAX,
  PRODUCT_NAME_MAX,
  productFormSchema,
  productSchema,
} from "@/lib/validators/product";

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

  it("aplica isAvailable = true por padrão", () => {
    const parsed = productSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.isAvailable).toBe(true);
  });

  it("aceita promoção menor que o preço", () => {
    expect(productSchema.safeParse({ ...valid, promoPriceCents: 1990 }).success).toBe(true);
  });

  it("barra promoção maior ou igual ao preço", () => {
    expect(productSchema.safeParse({ ...valid, promoPriceCents: 3290 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, promoPriceCents: 4000 }).success).toBe(false);
  });
});

const validForm = {
  name: "Batom",
  description: "",
  price: "32,90",
  promoPrice: "",
  isAvailable: true,
  imageUrl: valid.imageUrl,
};

describe("productFormSchema (promoção)", () => {
  it("aceita sem promoção", () => {
    expect(productFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("aceita promoção menor que o preço", () => {
    expect(productFormSchema.safeParse({ ...validForm, promoPrice: "19,90" }).success).toBe(true);
  });

  it("barra promoção maior ou igual ao preço", () => {
    expect(productFormSchema.safeParse({ ...validForm, promoPrice: "32,90" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...validForm, promoPrice: "40,00" }).success).toBe(false);
  });
});
