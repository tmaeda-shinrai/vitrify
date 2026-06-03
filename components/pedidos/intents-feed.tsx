"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { dayLabel, type IntentDayGroup } from "@/lib/intents";

/**
 * Feed das intenções de pedido (#0015) agrupado por dia. Mostra produto (ou
 * "Dúvida geral" quando sem produto), horário, dispositivo (sempre) e origem (Pro+).
 */
export function IntentsFeed({
  groups,
  showSource,
}: {
  groups: IntentDayGroup[];
  showSource: boolean;
}) {
  const t = useTranslations("pedidos");

  function headingFor(dayKey: string): string {
    const label = dayLabel(dayKey);
    if (label === "today") return t("today");
    if (label === "yesterday") return t("yesterday");
    return new Date(`${dayKey}T00:00:00`).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
    });
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.dayKey} className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            {headingFor(group.dayKey)}
          </h2>
          <ul className="divide-y divide-border rounded-lg border">
            {group.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.productName ?? t("generalInquiry")}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {item.device === "desktop" ? (
                        <Monitor className="size-3.5" aria-hidden />
                      ) : (
                        <Smartphone className="size-3.5" aria-hidden />
                      )}
                      {t(`device.${item.device ?? "desktop"}`)}
                    </span>
                    {showSource && item.source ? <span>{t(`source.${item.source}`)}</span> : null}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground" dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
