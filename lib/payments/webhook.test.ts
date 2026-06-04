import { describe, expect, it } from "vitest";

import type { PaymentRecord } from "./types";
import { eventIdFor, invoiceRowForPayment, subscriptionPatchForPayment } from "./webhook";

const baseRecord: PaymentRecord = {
  paymentId: "pay_1",
  subscriptionId: "sub_1",
  amountCents: 3900,
  status: "pending",
  paymentMethod: null,
  invoiceUrl: "https://asaas.com/i/pay_1",
  dueDate: "2026-06-10",
  paidAt: null,
};

describe("subscriptionPatchForPayment", () => {
  it("pago → ativa no plano do valor e avança o período", () => {
    const patch = subscriptionPatchForPayment({
      ...baseRecord,
      status: "paid",
      amountCents: 3900, // Pro mensal
      paidAt: "2026-06-09T03:00:00.000Z",
    });
    expect(patch.status).toBe("active");
    expect(patch.plan).toBe("pro");
    expect(patch.current_period_start).toBe("2026-06-09T03:00:00.000Z");
    expect(patch.current_period_end).toBe("2026-07-09T03:00:00.000Z");
  });

  it("pago no valor anual usa ciclo de um ano", () => {
    const patch = subscriptionPatchForPayment({
      ...baseRecord,
      status: "paid",
      amountCents: 66240, // Plus anual
      paidAt: "2026-06-09T03:00:00.000Z",
    });
    expect(patch.plan).toBe("plus");
    expect(patch.current_period_end).toBe("2027-06-09T03:00:00.000Z");
  });

  it("atraso → past_due; estorno → canceled; pendente → sem mudança", () => {
    expect(subscriptionPatchForPayment({ ...baseRecord, status: "overdue" })).toEqual({
      status: "past_due",
    });
    expect(subscriptionPatchForPayment({ ...baseRecord, status: "refunded" })).toEqual({
      status: "canceled",
    });
    expect(subscriptionPatchForPayment(baseRecord)).toEqual({});
  });
});

describe("invoiceRowForPayment", () => {
  it("mapeia os campos para a linha de invoices", () => {
    const row = invoiceRowForPayment(
      { ...baseRecord, status: "paid", paymentMethod: "pix", paidAt: "2026-06-09T03:00:00.000Z" },
      "sub-row-1",
    );
    expect(row).toMatchObject({
      subscription_id: "sub-row-1",
      asaas_payment_id: "pay_1",
      amount_cents: 3900,
      status: "paid",
      payment_method: "pix",
      due_date: "2026-06-10",
      invoice_url: "https://asaas.com/i/pay_1",
    });
  });

  it("usa a data de hoje quando o vencimento vem nulo", () => {
    const row = invoiceRowForPayment({ ...baseRecord, dueDate: null }, "sub-row-1");
    expect(row.due_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("eventIdFor", () => {
  it("usa o id do evento quando presente", () => {
    expect(eventIdFor({ id: "evt_42", event: "PAYMENT_CONFIRMED" })).toBe("evt_42");
  });

  it("cai num composto determinístico sem id", () => {
    expect(
      eventIdFor({ event: "PAYMENT_CONFIRMED", payment: { id: "pay_1", status: "CONFIRMED" } }),
    ).toBe("PAYMENT_CONFIRMED:pay_1:CONFIRMED");
  });
});
