import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Métricas agregadas do admin (#0023). Os números vêm da RPC `admin_metrics()`
 * (service role); os helpers de funil/percentual são puros e testáveis.
 */
export interface AdminMetrics {
  dau: number;
  mau: number;
  signups: number;
  onboarded: number;
  withProduct: number;
  with5Products: number;
  paid: number;
}

export interface FunnelStep {
  key: keyof AdminMetrics;
  label: string;
  count: number;
  /** % sobre o total de cadastros (0–100, arredondado). */
  pctOfSignups: number;
}

const ZERO: AdminMetrics = {
  dau: 0,
  mau: 0,
  signups: 0,
  onboarded: 0,
  withProduct: 0,
  with5Products: 0,
  paid: 0,
};

/** % inteiro de `count` sobre `base`; 0 se `base` for 0 (evita divisão por zero). */
export function pct(count: number, base: number): number {
  if (base <= 0) return 0;
  return Math.round((count / base) * 100);
}

const FUNNEL_LABELS: { key: keyof AdminMetrics; label: string }[] = [
  { key: "signups", label: "Cadastros" },
  { key: "onboarded", label: "Onboarding concluído" },
  { key: "withProduct", label: "Com ≥1 produto" },
  { key: "with5Products", label: "Com ≥5 produtos" },
  { key: "paid", label: "Plano pago" },
];

/** Passos do funil com contagem e % sobre o total de cadastros. */
export function funnelSteps(m: AdminMetrics): FunnelStep[] {
  return FUNNEL_LABELS.map(({ key, label }) => ({
    key,
    label,
    count: m[key],
    pctOfSignups: pct(m[key], m.signups),
  }));
}

/** Lê a RPC e normaliza para `AdminMetrics`. Tolera campos ausentes. */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const admin = createAdminClient();
  const { data } = await admin.rpc("admin_metrics");
  const raw = (data ?? {}) as Partial<Record<keyof AdminMetrics, number>>;
  return { ...ZERO, ...raw };
}
