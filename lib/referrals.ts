import { addDaysToDate } from "@/lib/payments/dates";
import { isPaidPlan, type SubscriptionPlan } from "@/lib/plan";

/**
 * Helpers do programa de indicação (#0020): o cookie que carrega o `?ref=` da
 * captura (middleware) até o cadastro (e-mail) / callback (OAuth) + a normalização
 * do código; e a decisão pura da recompensa do referrer (PR2). O link de indicação
 * aponta para a raiz do app (`?ref=<code>`), então a captura precisa sobreviver à
 * navegação até o cadastro — daí o cookie.
 */

/** Cookie httpOnly que guarda o código de indicação capturado. */
export const REFERRAL_COOKIE = "vitrinio_ref";

/** Validade curta do cookie (30 min) — folga entre clicar no link e se cadastrar. */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 30;

/**
 * Normaliza um código de indicação cru (querystring/cookie): maiúsculas, sem
 * espaços, só `[A-Z0-9]` de 4 a 20 chars. Retorna `null` se não casar — barra
 * lixo/injeção antes de gravar cookie ou consultar o banco (o lookup real do
 * referrer fica no trigger/RPC, que devolvem no-op para código inexistente).
 */
export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9]{4,20}$/.test(code) ? code : null;
}

/** Dias grátis dados ao referrer (≈1 mês) adiando o vencimento da próxima fatura. */
export const REFERRAL_REWARD_DAYS = 30;

export interface ReferralRewardDecision {
  /** Conceder a recompensa (adiar a próxima fatura do referrer). */
  shouldGrant: boolean;
  /** Novo vencimento `YYYY-MM-DD` da próxima fatura, ou null se não concede. */
  newDueDate: string | null;
}

/**
 * Decisão pura da recompensa do referrer quando a indicada vira pagante (#0020).
 * Concede só se: a indicada assinou um plano pago (Pro+), quem indica está em Pro+,
 * e há uma fatura pendente para adiar. O caso "já convertido" é barrado fora daqui
 * (filtro `converted_at IS NULL` no webhook). Não decide o `converted_at` — só a recompensa.
 */
export function decideReferralReward(params: {
  referrerPlan: SubscriptionPlan | null | undefined;
  referredPaidPlan: SubscriptionPlan | null | undefined;
  nextPaymentDueDate: string | null | undefined;
}): ReferralRewardDecision {
  if (!isPaidPlan(params.referredPaidPlan)) return { shouldGrant: false, newDueDate: null };
  if (!isPaidPlan(params.referrerPlan)) return { shouldGrant: false, newDueDate: null };
  if (!params.nextPaymentDueDate) return { shouldGrant: false, newDueDate: null };
  return {
    shouldGrant: true,
    newDueDate: addDaysToDate(params.nextPaymentDueDate, REFERRAL_REWARD_DAYS),
  };
}

export type ReferralStatus = "pending" | "converted" | "rewarded";

export interface ReferralRow {
  converted_at: string | null;
  reward_granted: boolean | null;
}

/** Status (partição) de uma indicação, para o badge da lista. Recompensa > convertida > pendente. */
export function referralStatus(row: ReferralRow): ReferralStatus {
  if (row.reward_granted) return "rewarded";
  if (row.converted_at) return "converted";
  return "pending";
}

export interface ReferralSummary {
  pending: number;
  converted: number;
  rewarded: number;
}

/**
 * Contadores do painel (#0020 PR3). `converted` inclui as já recompensadas (recompensa
 * é subconjunto de convertida); `pending + converted` = total. Puro/testável.
 */
export function summarizeReferrals(rows: ReferralRow[]): ReferralSummary {
  let pending = 0;
  let converted = 0;
  let rewarded = 0;
  for (const row of rows) {
    if (row.converted_at) converted += 1;
    else pending += 1;
    if (row.reward_granted) rewarded += 1;
  }
  return { pending, converted, rewarded };
}
