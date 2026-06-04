import { describe, expect, it } from "vitest";

import { PLAN_FEATURE_ROWS } from "./plan-features";

describe("PLAN_FEATURE_ROWS", () => {
  const byKey = Object.fromEntries(PLAN_FEATURE_ROWS.map((r) => [r.key, r]));

  it("Free limita produtos; Pro/Plus são ilimitados", () => {
    expect(byKey.productLimit).toMatchObject({
      free: "limit5",
      pro: "unlimited",
      plus: "unlimited",
    });
  });

  it("origem do tráfego e cores são pagos (Pro+)", () => {
    expect(byKey.trafficSource).toMatchObject({ free: false, pro: true, plus: true });
    expect(byKey.colors).toMatchObject({ free: false, pro: true, plus: true });
  });

  it("recursos exclusivos do Plus", () => {
    for (const key of [
      "video",
      "multiVitrines",
      "customDomain",
      "prioritySupport",
      "exportReports",
    ]) {
      expect(byKey[key]!.free).toBe(false);
      expect(byKey[key]!.pro).toBe(false);
      expect(byKey[key]!.plus).not.toBe(false);
    }
  });

  it("todas as linhas têm os três planos definidos", () => {
    for (const row of PLAN_FEATURE_ROWS) {
      for (const col of ["free", "pro", "plus"] as const) {
        expect(row[col]).toBeDefined();
      }
    }
  });
});
