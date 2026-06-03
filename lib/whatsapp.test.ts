import { describe, expect, it } from "vitest";

import {
  buildGeneralMessage,
  buildProductMessage,
  buildWhatsappUrl,
  firstName,
} from "@/lib/whatsapp";

describe("firstName", () => {
  it("pega o primeiro nome (ou vazio)", () => {
    expect(firstName("Maria Silva")).toBe("Maria");
    expect(firstName("   ")).toBe("");
    expect(firstName(null)).toBe("");
  });
});

describe("buildProductMessage", () => {
  it("usa o preço normal e inclui nome + link da vitrine", () => {
    expect(
      buildProductMessage({
        ownerName: "Maria Silva",
        productName: "Batom 234",
        priceCents: 3290,
        promoPriceCents: null,
        vitrineUrl: "https://vitrinio.com.br/maria",
      }),
    ).toBe(
      "Olá Maria, tenho interesse no produto: Batom 234 — R$ 32,90. Vitrine: https://vitrinio.com.br/maria",
    );
  });

  it("usa o preço promocional quando menor que o normal", () => {
    expect(
      buildProductMessage({
        ownerName: "Maria",
        productName: "Perfume",
        priceCents: 8900,
        promoPriceCents: 6900,
        vitrineUrl: "u",
      }),
    ).toContain("R$ 69,00");
  });
});

describe("buildGeneralMessage", () => {
  it("monta a mensagem genérica com saudação", () => {
    expect(buildGeneralMessage("Maria Silva")).toBe(
      "Olá Maria, vi sua vitrine e queria tirar uma dúvida.",
    );
  });
});

describe("buildWhatsappUrl", () => {
  it("usa só dígitos e codifica a mensagem", () => {
    expect(buildWhatsappUrl("+55 (11) 99999-8888", "Olá, tudo bem?")).toBe(
      "https://wa.me/5511999998888?text=Ol%C3%A1%2C%20tudo%20bem%3F",
    );
  });
});
