import { describe, expect, it } from "vitest";

import { inferBillingPeriod, SUBSCRIPTION_STATUS_VARIANT } from "./subscription";

describe("inferBillingPeriod", () => {
  it("período curto (~30d) é mensal", () => {
    expect(inferBillingPeriod("2026-06-01T00:00:00Z", "2026-07-01T00:00:00Z")).toBe("monthly");
  });

  it("período longo (~365d) é anual", () => {
    expect(inferBillingPeriod("2026-06-01T00:00:00Z", "2027-06-01T00:00:00Z")).toBe("yearly");
  });

  it("retorna null sem datas ou com intervalo inválido", () => {
    expect(inferBillingPeriod(null, "2027-06-01T00:00:00Z")).toBeNull();
    expect(inferBillingPeriod("2026-06-01T00:00:00Z", null)).toBeNull();
    expect(inferBillingPeriod("2026-07-01T00:00:00Z", "2026-06-01T00:00:00Z")).toBeNull();
  });
});

describe("SUBSCRIPTION_STATUS_VARIANT", () => {
  it("mapeia os estados para variantes de badge", () => {
    expect(SUBSCRIPTION_STATUS_VARIANT.active).toBe("default");
    expect(SUBSCRIPTION_STATUS_VARIANT.past_due).toBe("destructive");
    expect(SUBSCRIPTION_STATUS_VARIANT.canceled).toBe("outline");
  });
});
