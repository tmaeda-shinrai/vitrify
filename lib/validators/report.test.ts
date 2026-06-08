import { describe, expect, it } from "vitest";

import { reportSchema } from "@/lib/validators/report";

describe("reportSchema", () => {
  const base = { slug: "maria", reason: "copyright" as const };

  it("aceita denúncia válida", () => {
    expect(reportSchema.safeParse(base).success).toBe(true);
    expect(
      reportSchema.safeParse({
        ...base,
        description: "copiou minhas fotos",
        reporterEmail: "a@b.com",
      }).success,
    ).toBe(true);
  });

  it("aceita e-mail vazio (opcional)", () => {
    expect(reportSchema.safeParse({ ...base, reporterEmail: "" }).success).toBe(true);
  });

  it("rejeita motivo inválido", () => {
    expect(reportSchema.safeParse({ ...base, reason: "qualquer" }).success).toBe(false);
  });

  it("rejeita slug curto e e-mail inválido", () => {
    expect(reportSchema.safeParse({ ...base, slug: "ab" }).success).toBe(false);
    expect(reportSchema.safeParse({ ...base, reporterEmail: "naoehemail" }).success).toBe(false);
  });
});
