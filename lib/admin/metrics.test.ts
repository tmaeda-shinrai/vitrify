import { describe, expect, it } from "vitest";

import { funnelSteps, pct, type AdminMetrics } from "@/lib/admin/metrics";

const M: AdminMetrics = {
  dau: 3,
  mau: 10,
  signups: 100,
  onboarded: 80,
  withProduct: 60,
  with5Products: 25,
  paid: 12,
};

describe("pct", () => {
  it("calcula percentual inteiro", () => {
    expect(pct(80, 100)).toBe(80);
    expect(pct(1, 3)).toBe(33);
  });

  it("base zero → 0 (sem divisão por zero)", () => {
    expect(pct(5, 0)).toBe(0);
  });
});

describe("funnelSteps", () => {
  it("monta os passos na ordem com % sobre cadastros", () => {
    const steps = funnelSteps(M);
    expect(steps.map((s) => s.key)).toEqual([
      "signups",
      "onboarded",
      "withProduct",
      "with5Products",
      "paid",
    ]);
    const signups = steps.find((s) => s.key === "signups");
    const paid = steps.find((s) => s.key === "paid");
    expect(signups?.pctOfSignups).toBe(100);
    expect(paid).toMatchObject({ count: 12, pctOfSignups: 12 });
  });
});
