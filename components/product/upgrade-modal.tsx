"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Gancho de upgrade quando a vitrine Free atinge o limite de produtos. A tela de
 * comparação de planos e o checkout chegam na #0019 — por ora a CTA é placeholder.
 */
export function UpgradeModal({ open, onOpenChange }: Props) {
  const t = useTranslations("produtos");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("limitTitle")}</DialogTitle>
          <DialogDescription>{t("limitDescription")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("limitDismiss")}
          </Button>
          {/* TODO(#0019): abrir comparação de planos / checkout Asaas. */}
          <Button disabled>{t("limitCta")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
