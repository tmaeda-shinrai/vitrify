import { describe, expect, it } from "vitest";

import {
  PRODUCT_DESC_MAX,
  PRODUCT_IMAGES_MAX,
  PRODUCT_NAME_MAX,
  productFormSchema,
  productSchema,
} from "@/lib/validators/product";

const IMG_URL = "https://proj.supabase.co/storage/v1/object/public/products/u/x.webp";
const IMG = { url: IMG_URL, alt: "" };

const valid = {
  name: "Batom Matte Vermelho",
  description: "Longa duração, cor intensa.",
  priceCents: 3290,
  images: [IMG],
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
        images: valid.images,
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

  it("exige ao menos uma foto", () => {
    expect(productSchema.safeParse({ ...valid, images: [] }).success).toBe(false);
    expect(
      productSchema.safeParse({ name: valid.name, priceCents: valid.priceCents }).success,
    ).toBe(false);
  });

  it("aceita de 1 a 5 fotos e barra a 6ª", () => {
    const five = Array.from({ length: PRODUCT_IMAGES_MAX }, (_, i) => ({
      url: `https://x.test/${i}.webp`,
      alt: "",
    }));
    expect(productSchema.safeParse({ ...valid, images: five }).success).toBe(true);
    expect(
      productSchema.safeParse({
        ...valid,
        images: [...five, { url: "https://x.test/5.webp", alt: "" }],
      }).success,
    ).toBe(false);
  });

  it("aceita texto alternativo na foto e barra acima do limite", () => {
    expect(
      productSchema.safeParse({ ...valid, images: [{ url: IMG_URL, alt: "Batom vermelho" }] })
        .success,
    ).toBe(true);
    expect(
      productSchema.safeParse({ ...valid, images: [{ url: IMG_URL, alt: "a".repeat(121) }] })
        .success,
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

  it("aceita categoria (uuid) e marca", () => {
    expect(
      productSchema.safeParse({
        ...valid,
        categoryId: "11111111-1111-1111-1111-111111111111",
        brandName: "Natura",
      }).success,
    ).toBe(true);
  });

  it("barra categoryId que não é uuid e marca acima de 60", () => {
    expect(productSchema.safeParse({ ...valid, categoryId: "abc" }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, brandName: "a".repeat(61) }).success).toBe(false);
  });
});

const validForm = {
  name: "Batom",
  description: "",
  price: "32,90",
  promoPrice: "",
  isAvailable: true,
  images: [IMG],
};

describe("productFormSchema", () => {
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

  it("exige ao menos uma foto", () => {
    expect(productFormSchema.safeParse({ ...validForm, images: [] }).success).toBe(false);
  });

  it("aceita categoria vazia e marca livre", () => {
    expect(
      productFormSchema.safeParse({ ...validForm, categoryId: "", brandName: "Marca Nova" })
        .success,
    ).toBe(true);
  });
});
