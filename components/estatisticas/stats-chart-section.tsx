"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DailyStatRow } from "@/lib/stats";

// Lazy: o SVG do gráfico fica fora do bundle inicial do painel (ARCHITECTURE §7.2).
const StatsChart = dynamic(() => import("./stats-chart").then((m) => m.StatsChart), {
  ssr: false,
  loading: () => <div className="h-16 w-full animate-pulse rounded-md bg-muted" />,
});

const RANGES = [7, 30] as const;
type Range = (typeof RANGES)[number];

/**
 * Gráfico temporal de visitas e cliques (#0016 PR2) com alternância 7/30 dias.
 * Recebe a série de 30 dias já preenchida e recorta no cliente.
 */
export function StatsChartSection({ series }: { series: DailyStatRow[] }) {
  const t = useTranslations("estatisticas");
  const [range, setRange] = useState<Range>(7);
  const sliced = series.slice(-range);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">{t("chartTitle")}</CardTitle>
        <div
          role="group"
          aria-label={t("chartTitle")}
          className="flex gap-1 rounded-lg bg-muted p-1"
        >
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              aria-pressed={range === value}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(value === 7 ? "chartRange7" : "chartRange30")}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <figure className="space-y-1">
          <figcaption className="text-sm text-muted-foreground">{t("chartViewsLabel")}</figcaption>
          <StatsChart
            data={sliced.map((d) => ({ date: d.date, value: d.views }))}
            ariaLabel={t("chartViewsLabel")}
          />
        </figure>
        <figure className="space-y-1">
          <figcaption className="text-sm text-muted-foreground">
            {t("chartIntentsLabel")}
          </figcaption>
          <StatsChart
            data={sliced.map((d) => ({ date: d.date, value: d.intents }))}
            ariaLabel={t("chartIntentsLabel")}
            barClassName="fill-brand-secondary"
          />
        </figure>
      </CardContent>
    </Card>
  );
}
