import { isPaidPlan, type SubscriptionPlan } from "@/lib/plan";

/**
 * Limite efetivo de produtos exibidos na vitrine pública (#0019, `docs/PRICING.md`
 * §6.3). Calculado ao vivo: o plano pago some o limite, mas após 14 dias de
 * inadimplência a vitrine "volta ao limite Free" (esconde o excedente, sem apagar).
 */

/** 14 dias em past_due → a vitrine pública passa a mostrar só o limite Free. */
export const PAST_DUE_HIDE_DAYS = 14;

export function effectiveProductLimit(
  plan: SubscriptionPlan | null | undefined,
  pastDueSince: string | null | undefined,
  freeLimit: number,
  now: Date = new Date(),
): number | null {
  if (!isPaidPlan(plan)) return freeLimit;
  if (pastDueSince) {
    const age = (now.getTime() - new Date(pastDueSince).getTime()) / 86_400_000;
    if (age >= PAST_DUE_HIDE_DAYS) return freeLimit;
  }
  return null;
}
