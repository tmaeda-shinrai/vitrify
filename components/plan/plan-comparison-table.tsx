import { Check, Minus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { type FeatureValue, PLAN_FEATURE_ROWS } from "@/lib/plan-features";
import { cn } from "@/lib/utils";

type PlanColumn = "free" | "pro" | "plus";

const COLUMNS: PlanColumn[] = ["free", "pro", "plus"];

/**
 * Tabela de comparação Free/Pro/Plus (#0019), com uma coluna destacada (Pro por
 * padrão). Server Component: lê a copy via `getTranslations("assinar")`. Linhas em
 * `lib/plan-features.ts`. Rola horizontalmente no mobile.
 */
export async function PlanComparisonTable({ highlight = "pro" }: { highlight?: PlanColumn }) {
  const t = await getTranslations("assinar");

  function renderValue(value: FeatureValue) {
    if (value === true) {
      return <Check className="mx-auto size-4 text-primary" aria-label={t("included")} />;
    }
    if (value === false) {
      return (
        <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label={t("notIncluded")} />
      );
    }
    return <span className="text-xs font-medium">{t(`values.${value}`)}</span>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3 text-left font-medium text-muted-foreground">
              {t("featureColumn")}
            </th>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className={cn(
                  "px-2 py-3 text-center font-display font-semibold",
                  col === highlight && "rounded-t-lg bg-primary/10 text-primary",
                )}
              >
                {t(`plans.${col}.name`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_FEATURE_ROWS.map((row) => (
            <tr key={row.key} className="border-b last:border-0">
              <td className="py-2.5 pr-2 text-left text-muted-foreground">
                {t(`features.${row.key}`)}
              </td>
              {COLUMNS.map((col) => (
                <td
                  key={col}
                  className={cn("px-2 py-2.5 text-center", col === highlight && "bg-primary/5")}
                >
                  {renderValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
