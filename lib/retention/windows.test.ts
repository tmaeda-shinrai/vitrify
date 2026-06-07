import { describe, expect, it } from "vitest";

import {
  AUDIT_LOG_RETENTION_DAYS,
  ORDER_INTENT_IP_RETENTION_MONTHS,
  cutoffDaysAgo,
  cutoffMonthsAgo,
} from "@/lib/retention/windows";

describe("cutoffDaysAgo", () => {
  it("retrocede o número de dias informado", () => {
    const now = new Date("2026-06-07T09:30:00.000Z");
    expect(cutoffDaysAgo(now, AUDIT_LOG_RETENTION_DAYS)).toBe("2025-12-09T09:30:00.000Z");
  });

  it("não muta a data original", () => {
    const now = new Date("2026-06-07T00:00:00.000Z");
    cutoffDaysAgo(now, 180);
    expect(now.toISOString()).toBe("2026-06-07T00:00:00.000Z");
  });
});

describe("cutoffMonthsAgo", () => {
  it("retrocede o número de meses informado", () => {
    const now = new Date("2026-06-07T09:30:00.000Z");
    expect(cutoffMonthsAgo(now, ORDER_INTENT_IP_RETENTION_MONTHS)).toBe("2025-06-07T09:30:00.000Z");
  });
});
