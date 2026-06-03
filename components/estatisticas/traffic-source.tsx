import { getTranslations } from "next-intl/server";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceCount } from "@/lib/stats";

const KNOWN_SOURCES = new Set(["instagram", "facebook", "whatsapp", "tiktok", "google", "direct"]);

/**
 * Origem do tráfego (Pro+, #0016 PR2): barras por origem dos cliques de pedido.
 * Server Component; reusa os rótulos de origem do namespace `pedidos` (#0015).
 */
export async function TrafficSource({ data }: { data: SourceCount[] }) {
  const t = await getTranslations("estatisticas");
  const tSource = await getTranslations("pedidos");
  const max = Math.max(1, ...data.map((row) => row.count));
  const labelFor = (source: string) =>
    KNOWN_SOURCES.has(source) ? tSource(`source.${source}`) : source;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("sourceTitle")}</CardTitle>
        <CardDescription>{t("sourceHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {data.map((row) => (
            <li key={row.source} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span>{labelFor(row.source)}</span>
                <span className="font-medium tabular-nums">
                  {row.count.toLocaleString("pt-BR")}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-primary"
                  style={{ width: `${(row.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
