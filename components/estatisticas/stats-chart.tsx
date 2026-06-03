"use client";

import { cn } from "@/lib/utils";

export interface ChartPoint {
  /** Dia `YYYY-MM-DD`. */
  date: string;
  value: number;
}

const VIEWBOX_W = 300;
const VIEWBOX_H = 64;
const GAP = 2;

/**
 * Mini gráfico de barras em SVG puro (sem dependência), para os gráficos pequenos
 * do painel (#0016). Carregado sob demanda via next/dynamic. Cada barra tem um
 * `<title>` com data e valor (tooltip nativo + acessibilidade).
 */
export function StatsChart({
  data,
  ariaLabel,
  barClassName,
}: {
  data: ChartPoint[];
  ariaLabel: string;
  barClassName?: string;
}) {
  const max = Math.max(1, ...data.map((point) => point.value));
  const count = Math.max(1, data.length);
  const barWidth = (VIEWBOX_W - GAP * (count - 1)) / count;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      className="h-16 w-full"
    >
      {data.map((point, index) => {
        const height = point.value === 0 ? 1 : Math.max(2, (point.value / max) * (VIEWBOX_H - 2));
        const x = index * (barWidth + GAP);
        const [, month, dayOfMonth] = point.date.split("-");
        return (
          <rect
            key={point.date}
            x={x}
            y={VIEWBOX_H - height}
            width={barWidth}
            height={height}
            rx={1}
            className={cn("fill-brand-primary", point.value === 0 && "fill-muted", barClassName)}
          >
            <title>{`${dayOfMonth}/${month}: ${point.value}`}</title>
          </rect>
        );
      })}
    </svg>
  );
}
