import { describe, expect, it } from "vitest";

import {
  distinctBrands,
  formatWhatsappDisplay,
  themeModeClass,
  themePrimaryVars,
  vitrineTitle,
} from "@/lib/vitrine";

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
