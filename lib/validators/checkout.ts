import { z } from "zod";

import { isValidCpfCnpj } from "@/lib/cpf-cnpj";

/**
 * Payload do `POST /api/checkout` (#0018). `cpfCnpj` é validado por formato e
 * enviado ao Asaas para criar o cliente — **nunca persistido** por nós (forward-only,
 * minimização LGPD). O período anual existe na camada de pagamento; a UI só expõe
 * mensal por ora (a tela de planos com anual é #0019).
 */
export const checkoutSchema = z.object({
  plan: z.enum(["pro", "plus"]),
  period: z.enum(["monthly", "yearly"]),
  cpfCnpj: z.string().trim().refine(isValidCpfCnpj, "Informe um CPF ou CNPJ válido."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
