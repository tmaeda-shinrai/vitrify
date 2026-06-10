import { serverEnv } from "@/lib/env";

import {
  FiscalGatewayError,
  type FiscalGateway,
  type IssueInvoiceInput,
  type IssuedInvoice,
} from "./types";

const centsToReais = (cents: number) => Math.round(cents) / 100;

/**
 * Emissão de NFS-e pelo **módulo de NF-e do Asaas** (#0025). Reusa as credenciais de
 * pagamento (`ASAAS_API_URL`/`ASAAS_API_KEY`): como o Asaas já tem o cliente da cobrança
 * (CPF/CNPJ do checkout, forward-only), mandamos só o id da cobrança + descrição/valor —
 * nenhum dado fiscal pessoal nosso. Trabalha em reais (o Asaas é decimal).
 *
 * Pré-requisitos operacionais (com o contador) antes de `FISCAL_PROVIDER=asaas` em prod:
 * módulo de NF-e habilitado no Asaas + inscrição municipal, e `ASAAS_MUNICIPAL_SERVICE_CODE`
 * batendo com o código de serviço do município. Confirmar os campos exatos de `/invoices`
 * na doc do Asaas — este cliente cobre o caminho feliz.
 */
export class AsaasFiscalGateway implements FiscalGateway {
  isConfigured(): boolean {
    return Boolean(serverEnv.ASAAS_API_URL && serverEnv.ASAAS_API_KEY);
  }

  async issueInvoice(input: IssueInvoiceInput): Promise<IssuedInvoice> {
    let res: Response;
    try {
      res = await fetch(`${serverEnv.ASAAS_API_URL}/invoices`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          access_token: serverEnv.ASAAS_API_KEY ?? "",
        },
        body: JSON.stringify({
          payment: input.paymentId,
          serviceDescription: input.description,
          observations: input.description,
          value: centsToReais(input.amountCents),
          updatePayment: false,
          ...(serverEnv.ASAAS_MUNICIPAL_SERVICE_CODE
            ? { municipalServiceCode: serverEnv.ASAAS_MUNICIPAL_SERVICE_CODE }
            : {}),
        }),
      });
    } catch {
      throw new FiscalGatewayError("Falha de rede ao chamar o Asaas /invoices.");
    }

    if (!res.ok) {
      throw new FiscalGatewayError(`Asaas /invoices respondeu ${res.status}.`, res.status);
    }

    const data = (await res.json()) as { id?: string; status?: string; pdfUrl?: string | null };
    if (!data.id) throw new FiscalGatewayError("Resposta do Asaas /invoices sem id da nota.");

    return {
      nfeId: data.id,
      status: data.status === "AUTHORIZED" ? "issued" : "processing",
      url: data.pdfUrl ?? null,
    };
  }
}
