import { describe, expect, it } from "vitest";

import { formatBRL, parseBRLToCents } from "@/lib/money";

describe("formatBRL", () => {
  it("formata centavos como reais", () => {
    expect(formatBRL(3290)).toBe("R$ 32,90");
    expect(formatBRL(129990)).toBe("R$ 1.299,90");
    expect(formatBRL(0)).toBe("R$ 0,00");
  });

  it("usa espaço comum (código 32, sem nbsp) entre R$ e o valor", () => {
    expect(formatBRL(500)).toBe("R$ 5,00");
    expect(formatBRL(500).charCodeAt(2)).toBe(32); // espaço ASCII, não nbsp (160)
  });
});

describe("parseBRLToCents", () => {
  it("aceita máscara brasileira e prefixo R$", () => {
    expect(parseBRLToCents("32,90")).toBe(3290);
    expect(parseBRLToCents("R$ 32,90")).toBe(3290);
    expect(parseBRLToCents("1.299,90")).toBe(129990);
  });

  it("aceita ponto como separador decimal", () => {
    expect(parseBRLToCents("32.90")).toBe(3290);
  });

  it("trata só dígitos como reais inteiros", () => {
    expect(parseBRLToCents("100")).toBe(10000);
  });

  it("rejeita vazio, inválido e negativo", () => {
    expect(parseBRLToCents("")).toBeNull();
    expect(parseBRLToCents("abc")).toBeNull();
    expect(parseBRLToCents("-5")).toBeNull();
  });
});
