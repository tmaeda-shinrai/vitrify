import type { Database } from "@/types/supabase";

/**
 * Helpers puros de assinatura (#0019) para a tela "Meu plano". Não guardamos o
 * período (mensal/anual) na coluna — inferimos pela duração do período corrente.
 */

export type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/** Mensal vs anual a partir da duração `start→end` (anual ~365d). `null` se faltar data. */
export function inferBillingPeriod(
  startIso: string | null,
  endIso: string | null,
): "monthly" | "yearly" | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const days = (end - start) / 86_400_000;
  if (!Number.isFinite(days) || days <= 0) return null;
  return days > 200 ? "yearly" : "monthly";
}

export const SUBSCRIPTION_STATUS_VARIANT: Record<SubscriptionStatus, BadgeVariant> = {
  trialing: "secondary",
  active: "default",
  past_due: "destructive",
  canceled: "outline",
  expired: "outline",
};
