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
  /** Título/descrição customizados; sem eles cai na mensagem de limite de produtos. */
  title?: string;
  description?: string;
}

/**
 * Gancho de upgrade reutilizável. Por padrão mostra a mensagem do limite de produtos
 * (#0010); com `title`/`description` serve outros gatilhos (ex.: origem do tráfego e
 * 100 views, #0016). A comparação de planos e o checkout chegam na #0019 — por ora a
 * CTA é placeholder.
 */
export function UpgradeModal({ open, onOpenChange, title, description }: Props) {
  const t = useTranslations("produtos");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? t("limitTitle")}</DialogTitle>
          <DialogDescription>{description ?? t("limitDescription")}</DialogDescription>
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
