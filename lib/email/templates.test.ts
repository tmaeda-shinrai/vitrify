import { describe, expect, it } from "vitest";

import {
  dunningEmail,
  invoiceReceiptEmail,
  referralConvertedEmail,
  referralInviteEmail,
  subscriptionConfirmedEmail,
} from "./templates";

describe("templates de e-mail", () => {
  it("confirmação traz o nome do plano no assunto", () => {
    const mail = subscriptionConfirmedEmail({ planName: "Pro" });
    expect(mail.subject).toContain("Pro");
    expect(mail.html).toContain("Pro");
  });

  it("recibo traz valor e link da fatura quando há URL", () => {
    const mail = invoiceReceiptEmail({
      planName: "Plus",
      amountLabel: "R$ 69,00",
      invoiceUrl: "https://asaas.com/i/1",
    });
    expect(mail.html).toContain("R$ 69,00");
    expect(mail.html).toContain("https://asaas.com/i/1");
  });

  it("recibo omite o botão quando não há URL", () => {
    const mail = invoiceReceiptEmail({
      planName: "Pro",
      amountLabel: "R$ 39,00",
      invoiceUrl: null,
    });
    expect(mail.html).not.toContain("Ver fatura");
  });

  it("conversão de indicação anuncia o mês grátis e linka as indicações", () => {
    const mail = referralConvertedEmail();
    expect(mail.subject).toContain("1 mês");
    expect(mail.html).toContain("/conta/indicacoes");
  });

  it("nudge de indicação convida e linka o painel", () => {
    const mail = referralInviteEmail();
    expect(mail.subject.length).toBeGreaterThan(0);
    expect(mail.html).toContain("/conta/indicacoes");
  });

  it("dunning tem copy distinta por etapa e CTA de atualizar pagamento", () => {
    for (const stage of [1, 3, 7] as const) {
      const mail = dunningEmail(stage);
      expect(mail.subject.length).toBeGreaterThan(0);
      expect(mail.html).toContain("Atualizar pagamento");
    }
    expect(dunningEmail(1).subject).not.toBe(dunningEmail(7).subject);
  });
});
