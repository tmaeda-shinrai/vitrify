import { describe, expect, it } from "vitest";

import { isPaidPlan } from "@/lib/plan";

describe("isPaidPlan", () => {
  it("é falso no Free e sem assinatura", () => {
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan(null)).toBe(false);
    expect(isPaidPlan(undefined)).toBe(false);
  });

  it("é verdadeiro no Pro e no Plus", () => {
    expect(isPaidPlan("pro")).toBe(true);
    expect(isPaidPlan("plus")).toBe(true);
  });
});
