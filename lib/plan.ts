import type { Database } from "@/types/supabase";

export type SubscriptionPlan = Database["public"]["Enums"]["subscription_plan"];

/**
 * Planos pagos (Pro/Plus) desbloqueiam recursos avançados — ex.: origem do
 * tráfego no painel de Estatísticas (#0016) e o feed de origem em Pedidos (#0015).
 * Centraliza o check antes espalhado inline pelas páginas.
 */
export function isPaidPlan(plan: SubscriptionPlan | null | undefined): boolean {
  return plan === "pro" || plan === "plus";
}
