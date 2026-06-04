import type { BadgeVariant } from "@/lib/subscription";

/**
 * Helpers puros de faturas (#0019) para o histórico em "Meu plano". Os valores de
 * `status`/`payment_method` vêm do webhook do Asaas (#0018).
 */

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
  refunded: "outline",
};

export function invoiceStatusVariant(status: string): BadgeVariant {
  return STATUS_VARIANT[status] ?? "secondary";
}

/** Token i18n do método em `plano.method.<token>`; `null` quando ainda indefinido. */
export function invoiceMethodToken(method: string | null | undefined): string | null {
  if (method === "pix" || method === "credit_card" || method === "boleto") return method;
  return null;
}
