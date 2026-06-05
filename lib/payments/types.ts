/**
 * Camada de pagamento neutra (#0018). A interface abaixo não vaza o formato do
 * Asaas para os call-sites (`/api/checkout`, webhook): trocar de gateway por
 * Pagar.me = nova implementação de `PaymentGateway`, sem mexer em quem chama
 * (`docs/PRICING.md` §3.2). Valores trafegam sempre em **centavos** aqui; a
 * conversão para reais (formato do Asaas) é interna da implementação.
 */

export type PlanSlug = "pro" | "plus";
export type BillingPeriod = "monthly" | "yearly";

/** Ciclo de cobrança no vocabulário neutro (mapeado p/ o gateway na impl). */
export type BillingCycle = "MONTHLY" | "YEARLY";

/** Dados do cliente enviados ao gateway. O CPF/CNPJ é forward-only: vai para o
 *  gateway e nunca é persistido nem logado por nós (minimização LGPD). */
export interface CustomerInput {
  name: string;
  email: string;
  cpfCnpj: string;
  /** E.164 sem `+` (ex.: `5567999999999`), opcional. */
  mobilePhone?: string;
  /** Referência nossa (id da usuária) para conciliação. */
  externalReference?: string;
}

export interface CreatedCustomer {
  customerId: string;
}

export interface SubscriptionInput {
  customerId: string;
  valueCents: number;
  cycle: BillingCycle;
  description?: string;
  externalReference?: string;
}

export interface CreatedSubscription {
  subscriptionId: string;
  /** Id da 1ª cobrança — usado para aplicar desconto de cupom só nela (#0019). */
  firstPaymentId: string | null;
  /** Início do período corrente (ISO) — o webhook é a fonte autoritativa depois. */
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  /** Página hospedada da 1ª cobrança (PIX/cartão/boleto) para o redirect. */
  invoiceUrl: string | null;
}

/** Cobrança individual já normalizada (usada no checkout e no webhook). */
export interface PaymentRecord {
  paymentId: string;
  subscriptionId: string | null;
  amountCents: number;
  /** Status neutro derivado do status do gateway. */
  status: PaymentStatus;
  /** Método: `pix` | `credit_card` | `boleto` | null (ainda indefinido). */
  paymentMethod: PaymentMethod | null;
  invoiceUrl: string | null;
  /** `YYYY-MM-DD`. */
  dueDate: string | null;
  /** ISO do pagamento confirmado, ou null se ainda não pago. */
  paidAt: string | null;
}

export type PaymentStatus = "pending" | "paid" | "overdue" | "refunded";
export type PaymentMethod = "pix" | "credit_card" | "boleto";

export interface PaymentGateway {
  createCustomer(input: CustomerInput): Promise<CreatedCustomer>;
  createSubscription(input: SubscriptionInput): Promise<CreatedSubscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  /** Estorno integral de uma cobrança (garantia de 7 dias — #0019). */
  refundPayment(paymentId: string): Promise<void>;
  /** Ajusta uma cobrança (valor e/ou vencimento) — usado p/ cupom na 1ª cobrança (#0019). */
  updatePayment(
    paymentId: string,
    changes: { valueCents?: number; dueDate?: string },
  ): Promise<void>;
  getPayment(paymentId: string): Promise<PaymentRecord>;
  /** Próxima cobrança PENDENTE da assinatura (a vencer), ou null — recompensa de indicação (#0020). */
  getNextPendingPayment(subscriptionId: string): Promise<PaymentRecord | null>;
}

/** Erro de domínio — a `message` é segura para log (nunca traz CPF/cartão). */
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "PaymentGatewayError";
  }
}
