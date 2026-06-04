import type { BillingCycle, BillingPeriod, PlanSlug } from "./types";

/**
 * Catálogo de planos pagos (#0018). Os valores vivem em código (não em "plans"
 * do painel Asaas) para a assinatura ser criada com `value`+`cycle` direto —
 * os `ASAAS_PLAN_*_ID` do `.env` ficam como gancho futuro. Preços exatos em
 * `docs/PRICING.md` §2: Pro R$ 39/mês · R$ 374,40/ano; Plus R$ 69/mês · R$ 662,40/ano
 * (anual = -20%). Armazenados em centavos (`lib/money.ts`).
 */

export interface PlanCatalogEntry {
  plan: PlanSlug;
  period: BillingPeriod;
  valueCents: number;
  cycle: BillingCycle;
  /** Rótulo pt-BR para descrição da assinatura no gateway. */
  label: string;
}

export const PLAN_CATALOG: Record<PlanSlug, Record<BillingPeriod, PlanCatalogEntry>> = {
  pro: {
    monthly: {
      plan: "pro",
      period: "monthly",
      valueCents: 3900,
      cycle: "MONTHLY",
      label: "Pro mensal",
    },
    yearly: {
      plan: "pro",
      period: "yearly",
      valueCents: 37440,
      cycle: "YEARLY",
      label: "Pro anual",
    },
  },
  plus: {
    monthly: {
      plan: "plus",
      period: "monthly",
      valueCents: 6900,
      cycle: "MONTHLY",
      label: "Plus mensal",
    },
    yearly: {
      plan: "plus",
      period: "yearly",
      valueCents: 66240,
      cycle: "YEARLY",
      label: "Plus anual",
    },
  },
};

export function getPlanEntry(plan: PlanSlug, period: BillingPeriod): PlanCatalogEntry {
  return PLAN_CATALOG[plan][period];
}

/**
 * Descobre o plano/período pelo valor cobrado — usado no webhook para saber em
 * qual plano ativar a assinatura sem precisar de coluna extra. Os 4 valores são
 * distintos (3900/37440/6900/66240), então o mapeamento é único. (Cupons/descontos
 * mudariam isso, mas ficam para #0019.)
 */
export function planFromValueCents(
  valueCents: number,
): { plan: PlanSlug; period: BillingPeriod } | null {
  for (const plan of ["pro", "plus"] as const) {
    for (const period of ["monthly", "yearly"] as const) {
      if (PLAN_CATALOG[plan][period].valueCents === valueCents) return { plan, period };
    }
  }
  return null;
}
