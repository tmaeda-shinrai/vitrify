import { describe, expect, it } from "vitest";

import { type AsaasPaymentRaw, mapAsaasMethod, mapAsaasPayment, mapAsaasStatus } from "./asaas";

describe("mapAsaasStatus", () => {
  it("trata os status de pago", () => {
    expect(mapAsaasStatus("RECEIVED")).toBe("paid");
    expect(mapAsaasStatus("CONFIRMED")).toBe("paid");
    expect(mapAsaasStatus("RECEIVED_IN_CASH")).toBe("paid");
  });

  it("mapeia atraso e estorno", () => {
    expect(mapAsaasStatus("OVERDUE")).toBe("overdue");
    expect(mapAsaasStatus("REFUNDED")).toBe("refunded");
    expect(mapAsaasStatus("CHARGEBACK_REQUESTED")).toBe("refunded");
  });

  it("cai em pending para status desconhecido/pendente", () => {
    expect(mapAsaasStatus("PENDING")).toBe("pending");
    expect(mapAsaasStatus("QUALQUER_COISA")).toBe("pending");
  });
});

describe("mapAsaasMethod", () => {
  it("normaliza os billingTypes do Asaas", () => {
    expect(mapAsaasMethod("PIX")).toBe("pix");
    expect(mapAsaasMethod("CREDIT_CARD")).toBe("credit_card");
    expect(mapAsaasMethod("BOLETO")).toBe("boleto");
  });

  it("retorna null quando ainda indefinido", () => {
    expect(mapAsaasMethod("UNDEFINED")).toBeNull();
    expect(mapAsaasMethod(null)).toBeNull();
  });
});

describe("mapAsaasPayment", () => {
  const base: AsaasPaymentRaw = {
    id: "pay_123",
    subscription: "sub_123",
    value: 39.0,
    status: "PENDING",
    billingType: "UNDEFINED",
    invoiceUrl: "https://asaas.com/i/pay_123",
    dueDate: "2026-06-10",
    paymentDate: null,
    confirmedDate: null,
  };

  it("converte reais para centavos", () => {
    expect(mapAsaasPayment({ ...base, value: 39.9 }).amountCents).toBe(3990);
    expect(mapAsaasPayment({ ...base, value: 662.4 }).amountCents).toBe(66240);
  });

  it("não preenche paidAt enquanto pendente", () => {
    expect(mapAsaasPayment(base).paidAt).toBeNull();
    expect(mapAsaasPayment(base).status).toBe("pending");
  });

  it("preenche paidAt (ISO) quando confirmado", () => {
    const record = mapAsaasPayment({
      ...base,
      status: "CONFIRMED",
      billingType: "PIX",
      confirmedDate: "2026-06-09",
    });
    expect(record.status).toBe("paid");
    expect(record.paymentMethod).toBe("pix");
    expect(record.paidAt).toBe("2026-06-09T03:00:00.000Z"); // 00:00 BRT em UTC
  });

  it("preserva ids, invoiceUrl e dueDate", () => {
    const record = mapAsaasPayment(base);
    expect(record.paymentId).toBe("pay_123");
    expect(record.subscriptionId).toBe("sub_123");
    expect(record.invoiceUrl).toBe("https://asaas.com/i/pay_123");
    expect(record.dueDate).toBe("2026-06-10");
  });
});
