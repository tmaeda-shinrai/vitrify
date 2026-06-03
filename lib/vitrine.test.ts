import { describe, expect, it } from "vitest";

import {
  buildVitrineJsonLd,
  buildVitrineMetadata,
  distinctBrands,
  formatWhatsappDisplay,
  themeModeClass,
  themePrimaryVars,
  vitrineTitle,
  type PublicVitrine,
} from "@/lib/vitrine";

const vitrineFixture: PublicVitrine = {
  id: "v1",
  slug: "maria",
  title: "Beleza da Maria",
  subtitle: null,
  heroImageUrl: null,
  themeMode: "auto",
  themePrimary: null,
  owner: {
    fullName: "Maria Silva",
    bio: "Revendo Natura e Avon",
    avatarUrl: "https://x/avatar.webp",
    whatsapp: "5511999998888",
  },
  products: [
    {
      id: "a",
      name: "Perfume",
      description: "Floral",
      price_cents: 8900,
      promo_price_cents: 6900,
      is_available: true,
      category_id: null,
      category_name: null,
      brand_id: null,
      brand_name: "Natura",
      images: ["https://x/p.webp"],
      cover_url: "https://x/p.webp",
    },
  ],
};

describe("vitrineTitle", () => {
  it("usa o título quando personalizado", () => {
    expect(vitrineTitle({ title: "Beleza da Maria", ownerName: "Maria" })).toBe("Beleza da Maria");
  });

  it("cai para o nome quando o título é o placeholder ou vazio", () => {
    expect(vitrineTitle({ title: "Minha Vitrine", ownerName: "Maria Silva" })).toBe("Maria Silva");
    expect(vitrineTitle({ title: "", ownerName: "Maria Silva" })).toBe("Maria Silva");
  });

  it("usa fallback final quando não há nada", () => {
    expect(vitrineTitle({ title: null, ownerName: null })).toBe("Vitrine");
  });
});

describe("distinctBrands", () => {
  it("retorna marcas distintas (case-insensitive) preservando a ordem", () => {
    expect(
      distinctBrands([
        { brand_name: "Natura" },
        { brand_name: "natura" },
        { brand_name: "Avon" },
        { brand_name: null },
      ]),
    ).toEqual(["Natura", "Avon"]);
  });
});

describe("formatWhatsappDisplay", () => {
  it("formata número BR em E.164", () => {
    expect(formatWhatsappDisplay("5511999998888")).toBe("(11) 99999-8888");
  });

  it("devolve null/entrada quando não casa o padrão", () => {
    expect(formatWhatsappDisplay(null)).toBeNull();
    expect(formatWhatsappDisplay("123")).toBe("123");
  });
});

describe("themeModeClass", () => {
  it("mapeia o modo para a classe de tema", () => {
    expect(themeModeClass("dark")).toBe("dark");
    expect(themeModeClass("auto")).toBe("theme-auto");
    expect(themeModeClass("light")).toBe("");
  });
});

describe("themePrimaryVars", () => {
  it("vazio para default/ausente/inválido", () => {
    expect(themePrimaryVars(null)).toEqual({});
    expect(themePrimaryVars("#7C3AED")).toEqual({});
    expect(themePrimaryVars("xyz")).toEqual({});
  });

  it("gera --primary/--ring para cor custom", () => {
    expect(themePrimaryVars("#EC4899")).toEqual({
      "--primary": expect.stringMatching(/^\d+ \d+% \d+%$/),
      "--ring": expect.stringMatching(/^\d+ \d+% \d+%$/),
    });
  });
});

describe("buildVitrineMetadata", () => {
  it("monta title com marcas, canonical e OG image (fallback hero→avatar)", () => {
    const meta = buildVitrineMetadata(vitrineFixture, "https://vitrinio.com.br");
    expect(meta.title).toBe("Vitrine de Beleza da Maria — Natura");
    expect(meta.alternates?.canonical).toBe("https://vitrinio.com.br/maria");
    expect(meta.openGraph?.images).toEqual(["https://x/avatar.webp"]);
  });
});

describe("buildVitrineJsonLd", () => {
  it("gera ProfilePage com Person e Product (preço promo em BRL)", () => {
    const ld = buildVitrineJsonLd(vitrineFixture, "https://vitrinio.com.br") as {
      "@type": string;
      mainEntity: { name: string };
      hasPart: {
        itemListElement: { name: string; offers: { price: string; priceCurrency: string } }[];
      };
    };
    expect(ld["@type"]).toBe("ProfilePage");
    expect(ld.mainEntity.name).toBe("Beleza da Maria");
    const item = ld.hasPart.itemListElement[0]!;
    expect(item.name).toBe("Perfume");
    expect(item.offers.price).toBe("69.00");
    expect(item.offers.priceCurrency).toBe("BRL");
  });
});
