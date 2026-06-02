import { describe, expect, it } from "vitest";

import { isReservedSlug, SLUG_REGEX, slugify, suggestSlugs } from "@/lib/slug";

describe("SLUG_REGEX", () => {
  it("aceita slugs válidos", () => {
    expect(SLUG_REGEX.test("maria-cosmeticos")).toBe(true);
    expect(SLUG_REGEX.test("loja123")).toBe(true);
  });

  it("rejeita inválidos (maiúscula, curto, símbolo, hífen no início)", () => {
    expect(SLUG_REGEX.test("Maria")).toBe(false);
    expect(SLUG_REGEX.test("ab")).toBe(false);
    expect(SLUG_REGEX.test("loja_legal")).toBe(false);
    expect(SLUG_REGEX.test("-loja")).toBe(false);
  });
});

describe("isReservedSlug", () => {
  it("bloqueia reservados (case-insensitive)", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("ADMIN")).toBe(true);
    expect(isReservedSlug("produtos")).toBe(true);
  });

  it("libera slugs comuns", () => {
    expect(isReservedSlug("maria-cosmeticos")).toBe(false);
  });
});

describe("slugify", () => {
  it("normaliza acentos, espaços e símbolos", () => {
    expect(slugify("Maria José Conceição")).toBe("maria-jose-conceicao");
    expect(slugify("  Loja  da  Ana!! ")).toBe("loja-da-ana");
  });
});

describe("suggestSlugs", () => {
  it("gera sugestões válidas e não reservadas a partir do nome", () => {
    const out = suggestSlugs("Maria Silva");
    expect(out.length).toBeGreaterThan(0);
    out.forEach((s) => {
      expect(SLUG_REGEX.test(s)).toBe(true);
      expect(isReservedSlug(s)).toBe(false);
    });
  });

  it("não sugere nada para nomes curtos demais", () => {
    expect(suggestSlugs("Ana".slice(0, 1))).toEqual([]);
  });
});
