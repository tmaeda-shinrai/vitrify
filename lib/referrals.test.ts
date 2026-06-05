import { describe, expect, it } from "vitest";

import { decideReferralReward, normalizeReferralCode } from "./referrals";

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

describe("decideReferralReward", () => {
  it("indicada Pro + referrer Pro + fatura pendente → concede e adia +30d", () => {
    expect(
      decideReferralReward({
        referrerPlan: "pro",
        referredPaidPlan: "pro",
        nextPaymentDueDate: "2026-06-30",
      }),
    ).toEqual({ shouldGrant: true, newDueDate: "2026-07-30" });
  });

  it("referrer não é Pro+ → não concede", () => {
    expect(
      decideReferralReward({
        referrerPlan: "free",
        referredPaidPlan: "plus",
        nextPaymentDueDate: "2026-06-30",
      }),
    ).toEqual({ shouldGrant: false, newDueDate: null });
  });

  it("indicada não virou pagante (plano não-pago) → não concede", () => {
    expect(
      decideReferralReward({
        referrerPlan: "pro",
        referredPaidPlan: null,
        nextPaymentDueDate: "2026-06-30",
      }),
    ).toEqual({ shouldGrant: false, newDueDate: null });
  });

  it("sem fatura pendente para adiar → não concede", () => {
    expect(
      decideReferralReward({
        referrerPlan: "plus",
        referredPaidPlan: "pro",
        nextPaymentDueDate: null,
      }),
    ).toEqual({ shouldGrant: false, newDueDate: null });
  });
});
