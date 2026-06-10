/**
 * Camada fiscal neutra (#0025) — emissão de NFS-e. Espelha `lib/payments`: a interface
 * não vaza o provedor; trocar Asaas → NFE.io = nova implementação de `FiscalGateway`,
 * sem mexer no cron. Valores em **centavos** aqui (a impl converte). NENHUM dado fiscal
 * pessoal (CPF/CNPJ/endereço) passa por aqui — o provedor já tem o cliente da cobrança
 * (forward-only do #0018).
 */

export type FiscalProvider = "asaas" | "none";

export interface IssueInvoiceInput {
  /** Id da cobrança no gateway de pagamento (= `invoices.asaas_payment_id`). */
  paymentId: string;
  amountCents: number;
  /** Descrição do serviço prestado (ex.: "Assinatura Pro — Vitrinio"). */
  description: string;
}

export interface IssuedInvoice {
  /** Id da nota no provedor. */
  nfeId: string;
  /** `issued` = autorizada; `processing` = aceita e em processamento na prefeitura. */
  status: "issued" | "processing";
  /** Link do PDF/visualização, se já disponível. */
  url: string | null;
}

export interface FiscalGateway {
  /** True quando há credenciais/serviço configurados (senão a cron é no-op). */
  isConfigured(): boolean;
  /** Emite (ou agenda) a NFS-e da cobrança. Lança `FiscalGatewayError` em falha. */
  issueInvoice(input: IssueInvoiceInput): Promise<IssuedInvoice>;
}

/** Erro de domínio — a `message` é segura para log (nunca traz dado fiscal pessoal). */
export class FiscalGatewayError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "FiscalGatewayError";
  }
}
