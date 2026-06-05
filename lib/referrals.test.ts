import { describe, expect, it } from "vitest";

import { normalizeReferralCode } from "./referrals";

describe("normalizeReferralCode", () => {
  it("normaliza maiúsculas e remove espaços", () => {
    expect(normalizeReferralCode("  k7f2qx ")).toBe("K7F2QX");
  });

  it("aceita um código gerado típico (8 hex)", () => {
    expect(normalizeReferralCode("a1b2c3d4")).toBe("A1B2C3D4");
  });

  it("rejeita vazio/nulo", () => {
    expect(normalizeReferralCode(null)).toBeNull();
    expect(normalizeReferralCode(undefined)).toBeNull();
    expect(normalizeReferralCode("")).toBeNull();
    expect(normalizeReferralCode("   ")).toBeNull();
  });

  it("rejeita curto demais, longo demais e caracteres inválidos", () => {
    expect(normalizeReferralCode("abc")).toBeNull();
    expect(normalizeReferralCode("A".repeat(21))).toBeNull();
    expect(normalizeReferralCode("maria-123")).toBeNull();
    expect(normalizeReferralCode("../etc")).toBeNull();
    expect(normalizeReferralCode("DROP TABLE")).toBeNull();
  });
});
