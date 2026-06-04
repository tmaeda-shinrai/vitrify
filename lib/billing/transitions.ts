/**
 * Decisão pura das transições de billing por tempo (#0019, `docs/PRICING.md` §6.3).
 * Usada pela rota de cron. Nunca apaga produtos — só rebaixa o plano (a vitrine
 * esconde o excedente ao vivo, ver `lib/billing/limits`).
 */

export type BillingAction = "none" | "downgrade_past_due" | "downgrade_canceled";

/** 30 dias em past_due → cai oficialmente para Free (dados preservados). */
export const PAST_DUE_DOWNGRADE_DAYS = 30;

export interface BillingSubscription {
  plan: "free" | "pro" | "plus";
  status: string;
  past_due_since: string | null;
  canceled_at: string | null;
  current_period_end: string | null;
}

function ageDays(iso: string, now: Date): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000;
}

/** Etapa da régua de inadimplência (D1/D3/D7) para a idade do `past_due_since`. */
export function dunningStage(pastDueSince: string, now: Date = new Date()): 1 | 3 | 7 | null {
  const age = Math.floor(ageDays(pastDueSince, now));
  return age === 1 || age === 3 || age === 7 ? age : null;
}

export function decideBillingAction(
  sub: BillingSubscription,
  now: Date = new Date(),
): BillingAction {
  if (sub.plan === "free") return "none";

  if (
    sub.status === "past_due" &&
    sub.past_due_since &&
    ageDays(sub.past_due_since, now) >= PAST_DUE_DOWNGRADE_DAYS
  ) {
    return "downgrade_past_due";
  }

  // Cancelada e período já vencido → cai para Free.
  if (
    sub.canceled_at &&
    sub.current_period_end &&
    new Date(sub.current_period_end).getTime() <= now.getTime()
  ) {
    return "downgrade_canceled";
  }

  return "none";
}
