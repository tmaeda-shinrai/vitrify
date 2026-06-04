import { describe, expect, it } from "vitest";

import { applyDiscount } from "./coupons";

describe("applyDiscount", () => {
  it("percent: PRIMEIRA50 dá 50% na 1ª cobrança", () => {
    expect(applyDiscount(3900, "percent", 50)).toEqual({ firstChargeCents: 1950, freeDays: null });
  });

  it("percent: ANUAL30 sobre o anual", () => {
    expect(applyDiscount(37440, "percent", 30)).toEqual({
      firstChargeCents: 26208,
      freeDays: null,
    });
  });

  it("fixed_cents: abate o valor e não passa de zero", () => {
    expect(applyDiscount(3900, "fixed_cents", 1000).firstChargeCents).toBe(2900);
    expect(applyDiscount(500, "fixed_cents", 9999).firstChargeCents).toBe(0);
  });

  it("free_days: INDICACAO adia o vencimento, sem mudar valor", () => {
    expect(applyDiscount(3900, "free_days", 30)).toEqual({ firstChargeCents: null, freeDays: 30 });
  });
});
