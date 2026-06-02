import { describe, expect, it } from "vitest";

import { profileSchema, vitrineSchema } from "@/lib/validators/profile";

const profileBase = {
  fullName: "Maria Silva",
  bio: "Revendedora independente",
  whatsapp: "(67) 99999-9999",
};

describe("profileSchema", () => {
  it("aceita perfil válido e normaliza o WhatsApp", () => {
    const result = profileSchema.safeParse(profileBase);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.whatsapp).toBe("5567999999999");
  });

  it("aceita bio vazia", () => {
    expect(profileSchema.safeParse({ ...profileBase, bio: "" }).success).toBe(true);
  });

  it("rejeita bio acima de 160 caracteres", () => {
    const result = profileSchema.safeParse({ ...profileBase, bio: "a".repeat(161) });
    expect(result.success).toBe(false);
  });

  it("rejeita WhatsApp inválido", () => {
    expect(profileSchema.safeParse({ ...profileBase, whatsapp: "123" }).success).toBe(false);
  });
});

describe("vitrineSchema", () => {
  const base = { slug: "maria-cosmeticos", title: "Maria Cosméticos", subtitle: "" };

  it("aceita vitrine válida", () => {
    expect(vitrineSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita subtítulo acima de 120 caracteres", () => {
    expect(vitrineSchema.safeParse({ ...base, subtitle: "a".repeat(121) }).success).toBe(false);
  });

  it("rejeita slug reservado", () => {
    expect(vitrineSchema.safeParse({ ...base, slug: "admin" }).success).toBe(false);
  });
});
