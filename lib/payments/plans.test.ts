import { describe, expect, it } from "vitest";

import { PLAN_CATALOG, getPlanEntry } from "./plans";

describe("PLAN_CATALOG", () => {
  it("usa os preços exatos do PRICING.md §2 (em centavos)", () => {
    expect(getPlanEntry("pro", "monthly").valueCents).toBe(3900);
    expect(getPlanEntry("pro", "yearly").valueCents).toBe(37440);
    expect(getPlanEntry("plus", "monthly").valueCents).toBe(6900);
    expect(getPlanEntry("plus", "yearly").valueCents).toBe(66240);
  });

  it("anual equivale a 12x mensal com -20%", () => {
    for (const plan of ["pro", "plus"] as const) {
      const monthly = getPlanEntry(plan, "monthly").valueCents;
      const yearly = getPlanEntry(plan, "yearly").valueCents;
      expect(yearly).toBe(Math.round(monthly * 12 * 0.8));
    }
  });

  it("mapeia o período para o ciclo do gateway", () => {
    expect(getPlanEntry("pro", "monthly").cycle).toBe("MONTHLY");
    expect(getPlanEntry("plus", "yearly").cycle).toBe("YEARLY");
  });

  it("cobre os dois planos e os dois períodos", () => {
    expect(Object.keys(PLAN_CATALOG)).toEqual(["pro", "plus"]);
    expect(Object.keys(PLAN_CATALOG.pro)).toEqual(["monthly", "yearly"]);
  });
});
