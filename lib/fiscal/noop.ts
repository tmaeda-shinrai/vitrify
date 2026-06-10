import {
  FiscalGatewayError,
  type FiscalGateway,
  type IssueInvoiceInput,
  type IssuedInvoice,
} from "./types";

/**
 * Gateway fiscal no-op (padrão dos no-ops do projeto: dev/CI seguem sem emitir). Sem
 * provedor configurado, a cron checa `isConfigured()` e não toca em nada — então
 * `issueInvoice` nunca é chamado; se for, falha alto e claro.
 */
export class NoopFiscalGateway implements FiscalGateway {
  isConfigured(): boolean {
    return false;
  }

  async issueInvoice(_input: IssueInvoiceInput): Promise<IssuedInvoice> {
    throw new FiscalGatewayError("Provedor fiscal não configurado.");
  }
}
