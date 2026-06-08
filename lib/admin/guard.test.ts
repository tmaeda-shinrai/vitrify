import { describe, expect, it } from "vitest";

import { isAdminEmail } from "@/lib/admin/guard";

describe("isAdminEmail", () => {
  const list = "Admin@vitrinio.com.br, dono@vitrinio.com.br";

  it("aceita e-mail da lista (case-insensitive, trim)", () => {
    expect(isAdminEmail("admin@vitrinio.com.br", list)).toBe(true);
    expect(isAdminEmail("  DONO@vitrinio.com.br ", list)).toBe(true);
  });

  it("rejeita e-mail fora da lista", () => {
    expect(isAdminEmail("alguem@gmail.com", list)).toBe(false);
  });

  it("lista vazia ou ausente → ninguém é admin", () => {
    expect(isAdminEmail("admin@vitrinio.com.br", "")).toBe(false);
    expect(isAdminEmail("admin@vitrinio.com.br", undefined)).toBe(false);
  });

  it("e-mail nulo/vazio → false", () => {
    expect(isAdminEmail(null, list)).toBe(false);
    expect(isAdminEmail("", list)).toBe(false);
  });
});
