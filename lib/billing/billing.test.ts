import { describe, expect, it } from "vitest";

import { effectiveProductLimit } from "./limits";
import { type BillingSubscription, decideBillingAction } from "./transitions";

const now = new Date("2026-07-15T12:00:00Z");

function sub(partial: Partial<BillingSubscription>): BillingSubscription {
  return {
    plan: "pro",
    status: "active",
    past_due_since: null,
    canceled_at: null,
    current_period_end: null,
    ...partial,
  };
}

describe("decideBillingAction", () => {
  it("past_due há ≥30 dias → downgrade", () => {
    expect(
      decideBillingAction(sub({ status: "past_due", past_due_since: "2026-06-10T00:00:00Z" }), now),
    ).toBe("downgrade_past_due");
  });

  it("past_due há <30 dias → nada", () => {
    expect(
      decideBillingAction(sub({ status: "past_due", past_due_since: "2026-07-01T00:00:00Z" }), now),
    ).toBe("none");
  });

  it("cancelada com período vencido → downgrade", () => {
    expect(
      decideBillingAction(
        sub({ canceled_at: "2026-07-01T00:00:00Z", current_period_end: "2026-07-10T00:00:00Z" }),
        now,
      ),
    ).toBe("downgrade_canceled");
  });

  it("cancelada mas período ainda vigente → nada", () => {
    expect(
      decideBillingAction(
        sub({ canceled_at: "2026-07-01T00:00:00Z", current_period_end: "2026-08-10T00:00:00Z" }),
        now,
      ),
    ).toBe("none");
  });

  it("plano free nunca tem ação", () => {
    expect(
      decideBillingAction(
        sub({ plan: "free", status: "past_due", past_due_since: "2026-01-01T00:00:00Z" }),
        now,
      ),
    ).toBe("none");
  });
});

describe("effectiveProductLimit", () => {
  it("plano pago em dia → sem limite", () => {
    expect(effectiveProductLimit("pro", null, 5, now)).toBeNull();
  });

  it("plano free → limite Free", () => {
    expect(effectiveProductLimit("free", null, 5, now)).toBe(5);
  });

  it("pago e past_due há ≥14 dias → esconde excedente (limite Free)", () => {
    expect(effectiveProductLimit("pro", "2026-06-20T00:00:00Z", 5, now)).toBe(5);
  });

  it("pago e past_due há <14 dias → ainda sem limite (graça)", () => {
    expect(effectiveProductLimit("pro", "2026-07-10T00:00:00Z", 5, now)).toBeNull();
  });
});
