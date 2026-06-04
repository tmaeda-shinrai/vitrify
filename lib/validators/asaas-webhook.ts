import { z } from "zod";

/**
 * Envelope do webhook do Asaas (#0018 PR3). Validamos só os campos que usamos; o
 * Asaas envia muito mais. `payment` está presente nos eventos `PAYMENT_*` (os que
 * nos interessam); eventos de assinatura vêm com outro objeto e são ignorados por ora.
 */
export const asaasPaymentSchema = z.object({
  id: z.string(),
  customer: z.string().nullish(),
  subscription: z.string().nullish(),
  value: z.number(),
  status: z.string(),
  billingType: z.string().nullish(),
  invoiceUrl: z.string().nullish(),
  dueDate: z.string().nullish(),
  paymentDate: z.string().nullish(),
  confirmedDate: z.string().nullish(),
});

export const asaasWebhookSchema = z.object({
  /** id do evento (ex.: `evt_...`) — chave de idempotência quando presente. */
  id: z.string().optional(),
  event: z.string(),
  payment: asaasPaymentSchema.optional(),
});

export type AsaasWebhookPayload = z.infer<typeof asaasWebhookSchema>;
export type AsaasWebhookPayment = z.infer<typeof asaasPaymentSchema>;
