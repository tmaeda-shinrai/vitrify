"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";

import { UpgradeModal } from "@/components/product/upgrade-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Larguras decorativas (%) da amostra borrada por trás do cadeado.
const SAMPLE_WIDTHS = [72, 48, 30, 16];

/**
 * Origem do tráfego no plano Free (#0016 PR2): amostra borrada + cadeado e CTA de
 * upgrade. O dado real não é consultado para o Free (a página só busca no Pro+).
 */
export function TrafficSourceLocked() {
  const t = useTranslations("estatisticas");
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("sourceTitle")}</CardTitle>
        <CardDescription>{t("sourceHint")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ul className="select-none space-y-3 blur-sm" aria-hidden>
            {SAMPLE_WIDTHS.map((width) => (
              <li key={width} className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand-primary/60"
                  style={{ width: `${width}%` }}
                />
              </li>
            ))}
          </ul>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <Lock className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">{t("sourceLockedTitle")}</p>
            <p className="max-w-xs text-xs text-muted-foreground">{t("sourceLockedDescription")}</p>
            <Button size="sm" onClick={() => setOpen(true)}>
              {t("sourceUpgradeCta")}
            </Button>
          </div>
        </div>
      </CardContent>
      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        title={t("sourceLockedTitle")}
        description={t("sourceLockedDescription")}
      />
    </Card>
  );
}
