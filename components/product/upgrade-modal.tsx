"use client";

import Link from "next/link";
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
 * 100 views, #0016). A CTA leva ao checkout do Asaas (`/assinar`, #0018); a tela de
 * comparação de planos com anual/cupons é #0019.
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
          <Button asChild>
            <Link href="/assinar">{t("limitCta")}</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
