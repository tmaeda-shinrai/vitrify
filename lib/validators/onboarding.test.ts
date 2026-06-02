import { describe, expect, it } from "vitest";

import { nameSchema, slugSchema, whatsappSchema } from "@/lib/validators/onboarding";

describe("nameSchema", () => {
  it("apara e aceita nome válido", () => {
    expect(nameSchema.parse("  Maria Silva ")).toBe("Maria Silva");
  });
  it("rejeita nome muito curto", () => {
    expect(nameSchema.safeParse("M").success).toBe(false);
  });
});

describe("slugSchema", () => {
  it("aceita e normaliza para minúsculas", () => {
    expect(slugSchema.parse("Maria-Cosmeticos")).toBe("maria-cosmeticos");
  });
  it("rejeita formato inválido", () => {
    expect(slugSchema.safeParse("ab").success).toBe(false);
    expect(slugSchema.safeParse("loja_legal").success).toBe(false);
  });
  it("rejeita reservado", () => {
    expect(slugSchema.safeParse("dashboard").success).toBe(false);
  });
});

describe("whatsappSchema", () => {
  it("normaliza máscara para E.164 sem +", () => {
    expect(whatsappSchema.parse("(67) 99999-9999")).toBe("5567999999999");
  });
  it("aceita já normalizado", () => {
    expect(whatsappSchema.parse("5567999999999")).toBe("5567999999999");
  });
  it("rejeita sem o 9 do celular", () => {
    expect(whatsappSchema.safeParse("(67) 3333-3333").success).toBe(false);
  });
  it("rejeita DDD inválido", () => {
    expect(whatsappSchema.safeParse("5500999999999").success).toBe(false);
  });
});
