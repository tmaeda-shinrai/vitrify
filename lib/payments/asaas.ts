import { serverEnv } from "@/lib/env";

import {
  type CreatedCustomer,
  type CreatedSubscription,
  type CustomerInput,
  type PaymentGateway,
  PaymentGatewayError,
  type PaymentMethod,
  type PaymentRecord,
  type PaymentStatus,
  type SubscriptionInput,
} from "./types";

/**
 * Implementação Asaas da `PaymentGateway` (#0018). Cliente HTTP simples sobre
 * `ASAAS_API_URL` autenticado pelo header `access_token`. O Asaas trabalha em
 * **reais** (decimal), então convertemos de/para centavos aqui. Nada de PII é
 * logado: as mensagens de `PaymentGatewayError` trazem só a descrição do gateway.
 */

/** Forma crua de uma cobrança no Asaas (campos que usamos). */
export interface AsaasPaymentRaw {
  id: string;
  subscription: string | null;
  value: number;
  status: string;
  billingType: string;
  invoiceUrl: string | null;
  dueDate: string | null;
  paymentDate: string | null;
  confirmedDate?: string | null;
}

const centsToReais = (cents: number) => Math.round(cents) / 100;
const reaisToCents = (reais: number) => Math.round(reais * 100);

/** Data de hoje em America/Sao_Paulo no formato `YYYY-MM-DD` exigido pelo Asaas. */
function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** `YYYY-MM-DD` (+ horário 00:00 BRT) → ISO, ou null. */
function dateToIso(date: string | null | undefined): string | null {
  if (!date) return null;
  const iso = new Date(`${date}T00:00:00-03:00`);
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

/** Adiciona um ciclo à data base (`YYYY-MM-DD`) → ISO do fim do período. */
function addCycle(date: string, cycle: "MONTHLY" | "YEARLY"): string | null {
  const base = new Date(`${date}T00:00:00-03:00`);
  if (Number.isNaN(base.getTime())) return null;
  if (cycle === "YEARLY") base.setFullYear(base.getFullYear() + 1);
  else base.setMonth(base.getMonth() + 1);
  return base.toISOString();
}

/** Status do Asaas → status neutro de fatura. */
export function mapAsaasStatus(status: string): PaymentStatus {
  switch (status) {
    case "RECEIVED":
    case "CONFIRMED":
    case "RECEIVED_IN_CASH":
      return "paid";
    case "OVERDUE":
      return "overdue";
    case "REFUNDED":
    case "REFUND_REQUESTED":
    case "CHARGEBACK_REQUESTED":
    case "CHARGEBACK_DISPUTE":
      return "refunded";
    default:
      return "pending";
  }
}

/** `billingType` do Asaas → método neutro, ou null se ainda indefinido. */
export function mapAsaasMethod(billingType: string | null | undefined): PaymentMethod | null {
  switch (billingType) {
    case "PIX":
      return "pix";
    case "CREDIT_CARD":
    case "DEBIT_CARD":
      return "credit_card";
    case "BOLETO":
      return "boleto";
    default:
      return null;
  }
}

/** Cobrança crua do Asaas → `PaymentRecord` neutro (reutilizado pelo webhook). */
export function mapAsaasPayment(raw: AsaasPaymentRaw): PaymentRecord {
  const status = mapAsaasStatus(raw.status);
  return {
    paymentId: raw.id,
    subscriptionId: raw.subscription ?? null,
    amountCents: reaisToCents(raw.value),
    status,
    paymentMethod: mapAsaasMethod(raw.billingType),
    invoiceUrl: raw.invoiceUrl ?? null,
    dueDate: raw.dueDate ?? null,
    paidAt: status === "paid" ? dateToIso(raw.confirmedDate ?? raw.paymentDate) : null,
  };
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = serverEnv.ASAAS_API_URL;
  if (!base || !serverEnv.ASAAS_API_KEY) {
    throw new PaymentGatewayError("Asaas não está configurado (ASAAS_API_URL/API_KEY ausentes).");
  }

  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: serverEnv.ASAAS_API_KEY,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let description = `Asaas respondeu ${res.status}`;
    try {
      const body = (await res.json()) as { errors?: Array<{ description?: string }> };
      const first = body?.errors?.[0]?.description;
      if (typeof first === "string" && first.length > 0) description = first;
    } catch {
      // corpo não-JSON: mantém a mensagem genérica
    }
    throw new PaymentGatewayError(description, res.status);
  }

  return (await res.json()) as T;
}

export class AsaasGateway implements PaymentGateway {
  async createCustomer(input: CustomerInput): Promise<CreatedCustomer> {
    const data = await asaasFetch<{ id: string }>("/customers", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        cpfCnpj: input.cpfCnpj,
        mobilePhone: input.mobilePhone,
        externalReference: input.externalReference,
      }),
    });
    return { customerId: data.id };
  }

  async createSubscription(input: SubscriptionInput): Promise<CreatedSubscription> {
    const nextDueDate = todayInSaoPaulo();
    const sub = await asaasFetch<{ id: string }>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: input.customerId,
        // `UNDEFINED` deixa a usuária escolher PIX/cartão/boleto na página hospedada.
        billingType: "UNDEFINED",
        value: centsToReais(input.valueCents),
        cycle: input.cycle,
        nextDueDate,
        description: input.description,
        externalReference: input.externalReference,
      }),
    });

    // A 1ª cobrança da assinatura traz a página hospedada (invoiceUrl) do redirect.
    const payments = await asaasFetch<{ data: AsaasPaymentRaw[] }>(
      `/subscriptions/${sub.id}/payments?limit=1`,
    );
    const first = payments.data?.[0] ?? null;

    return {
      subscriptionId: sub.id,
      firstPaymentId: first?.id ?? null,
      currentPeriodStart: dateToIso(nextDueDate),
      currentPeriodEnd: addCycle(nextDueDate, input.cycle),
      invoiceUrl: first?.invoiceUrl ?? null,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await asaasFetch<{ deleted: boolean }>(`/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
  }

  async refundPayment(paymentId: string): Promise<void> {
    await asaasFetch<{ status: string }>(`/payments/${paymentId}/refund`, {
      method: "POST",
    });
  }

  async updatePayment(
    paymentId: string,
    changes: { valueCents?: number; dueDate?: string },
  ): Promise<void> {
    const body: Record<string, unknown> = {};
    if (changes.valueCents !== undefined) body.value = centsToReais(changes.valueCents);
    if (changes.dueDate) body.dueDate = changes.dueDate;
    await asaasFetch<{ id: string }>(`/payments/${paymentId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async getPayment(paymentId: string): Promise<PaymentRecord> {
    const raw = await asaasFetch<AsaasPaymentRaw>(`/payments/${paymentId}`);
    return mapAsaasPayment(raw);
  }

  async getNextPendingPayment(subscriptionId: string): Promise<PaymentRecord | null> {
    // Lista as cobranças da assinatura e escolhe a PENDENTE de menor vencimento — sem
    // depender da ordenação/filtro do gateway (robusto a variações da API).
    const payments = await asaasFetch<{ data: AsaasPaymentRaw[] }>(
      `/subscriptions/${subscriptionId}/payments?limit=50`,
    );
    const pending = (payments.data ?? [])
      .map(mapAsaasPayment)
      .filter((p) => p.status === "pending" && p.dueDate)
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
    return pending[0] ?? null;
  }
}
