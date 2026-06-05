"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { useTranslations } from "next-intl";

import { UpgradeModal } from "@/components/product/upgrade-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Estado bloqueado do painel de indicações para o plano Free (#0020 PR3): o
 * programa é Pro+. Reusa EmptyState + UpgradeModal (mesmo gancho de upgrade do #0016).
 */
export function ReferralGate() {
  const t = useTranslations("indicacoes");
  const [open, setOpen] = useState(false);

  return (
    <>
      <EmptyState
        icon={Gift}
        title={t("lockedTitle")}
        description={t("lockedDescription")}
        action={<Button onClick={() => setOpen(true)}>{t("lockedCta")}</Button>}
      />
      <UpgradeModal
        open={open}
        onOpenChange={setOpen}
        title={t("lockedTitle")}
        description={t("lockedDescription")}
      />
    </>
  );
}
