import { describe, expect, it } from "vitest";

import { isWithinRefundWindow } from "./refund";

describe("isWithinRefundWindow", () => {
  const now = new Date("2026-06-10T12:00:00Z");

  it("dentro de 7 dias é elegível", () => {
    expect(isWithinRefundWindow("2026-06-09T12:00:00Z", now)).toBe(true);
    expect(isWithinRefundWindow("2026-06-04T00:00:00Z", now)).toBe(true); // ~6,5 dias
  });

  it("além de 7 dias não é elegível", () => {
    expect(isWithinRefundWindow("2026-06-01T00:00:00Z", now)).toBe(false);
  });

  it("sem data ou data inválida não é elegível", () => {
    expect(isWithinRefundWindow(null, now)).toBe(false);
    expect(isWithinRefundWindow(undefined, now)).toBe(false);
    expect(isWithinRefundWindow("não-é-data", now)).toBe(false);
  });

  it("pagamento no futuro (relógio torto) não é elegível", () => {
    expect(isWithinRefundWindow("2026-06-20T00:00:00Z", now)).toBe(false);
  });
});
