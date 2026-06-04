/**
 * Linhas da "Divisão por plano" (#0019) — fonte única para a `PlanComparisonTable`
 * (`docs/FEATURES.md` §Divisão por plano). Cada valor é `true` (✓), `false` (—) ou
 * um token i18n resolvido em `assinar.values.<token>` (ex.: "5 produtos", "Ilimitado").
 * Dado puro, seguro no cliente.
 */

export type FeatureValue = boolean | string;

export interface PlanFeatureRow {
  /** Chave i18n da linha em `assinar.features.<key>`. */
  key: string;
  free: FeatureValue;
  pro: FeatureValue;
  plus: FeatureValue;
}

export const PLAN_FEATURE_ROWS: PlanFeatureRow[] = [
  { key: "publicVitrine", free: true, pro: true, plus: true },
  { key: "slug", free: true, pro: true, plus: true },
  { key: "whatsapp", free: true, pro: true, plus: true },
  { key: "productLimit", free: "limit5", pro: "unlimited", plus: "unlimited" },
  { key: "multiPhotos", free: true, pro: true, plus: true },
  { key: "categories", free: true, pro: true, plus: true },
  { key: "basicStats", free: true, pro: true, plus: true },
  { key: "trafficSource", free: false, pro: true, plus: true },
  { key: "colors", free: false, pro: true, plus: true },
  { key: "video", free: false, pro: false, plus: true },
  { key: "multiVitrines", free: false, pro: false, plus: "upTo3" },
  { key: "customDomain", free: false, pro: false, plus: true },
  { key: "prioritySupport", free: false, pro: false, plus: true },
  { key: "exportReports", free: false, pro: false, plus: true },
];
