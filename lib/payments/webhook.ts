import { planFromValueCents } from "./plans";
import type { PaymentRecord } from "./types";

/**
 * Helpers puros do webhook do Asaas (#0018 PR3). Mantidos fora do route handler
 * para serem testáveis sem mockar a request/o banco. Traduzem uma cobrança
 * normalizada (`PaymentRecord`) em efeito sobre `subscriptions`/`invoices`.
 */

export interface SubscriptionPatch {
  status?: "active" | "past_due" | "canceled";
  plan?: "pro" | "plus";
  current_period_start?: string;
  current_period_end?: string;
}

function addPeriod(iso: string, period: "monthly" | "yearly"): string {
  const d = new Date(iso);
  if (period === "yearly") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

/**
 * O que mudar na assinatura conforme o status da cobrança. Pago → ativa no plano
 * correspondente ao valor (e avança o período); atraso → past_due; estorno →
 * cancelado; pendente → nada (`{}`). NUNCA rebaixa para `free` aqui.
 */
export function subscriptionPatchForPayment(record: PaymentRecord): SubscriptionPatch {
  if (record.status === "paid") {
    const patch: SubscriptionPatch = { status: "active" };
    const mapped = planFromValueCents(record.amountCents);
    if (mapped) {
      patch.plan = mapped.plan;
      const start = record.paidAt ?? new Date().toISOString();
      patch.current_period_start = start;
      patch.current_period_end = addPeriod(start, mapped.period);
    }
    return patch;
  }
  if (record.status === "overdue") return { status: "past_due" };
  if (record.status === "refunded") return { status: "canceled" };
  return {};
}

/** Linha de `invoices` para upsert (idempotente por `asaas_payment_id`). */
export function invoiceRowForPayment(record: PaymentRecord, subscriptionId: string) {
  return {
    subscription_id: subscriptionId,
    asaas_payment_id: record.paymentId,
    amount_cents: record.amountCents,
    status: record.status,
    payment_method: record.paymentMethod,
    paid_at: record.paidAt,
    due_date: record.dueDate ?? new Date().toISOString().slice(0, 10),
    invoice_url: record.invoiceUrl,
  };
}

/** Chave de idempotência: o id do evento, ou um composto determinístico. */
export function eventIdFor(payload: {
  id?: string;
  event: string;
  payment?: { id: string; status: string };
}): string {
  if (payload.id) return payload.id;
  return `${payload.event}:${payload.payment?.id ?? "none"}:${payload.payment?.status ?? "none"}`;
}
