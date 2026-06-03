"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { UpgradeModal } from "@/components/product/upgrade-modal";
import { Button } from "@/components/ui/button";

/**
 * Gancho de upgrade ao passar de 100 visualizações (PRICING §5.1) — o "sinal" do
 * #0016; push/e-mail ficam para #0019/marketing. A página só renderiza no Free.
 */
export function ViewsUpgradeBanner() {
  const t = useTranslations("estatisticas");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-brand-primary/30 bg-brand-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{t("viewsMilestoneTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("viewsMilestoneDescription")}</p>
      </div>
      <Button size="sm" className="shrink-0" onClick={() => setOpen(true)}>
        {t("viewsMilestoneCta")}
      </Button>
      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        title={t("viewsMilestoneTitle")}
        description={t("viewsMilestoneDescription")}
      />
    </div>
  );
}
