"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/hooks/use-current-user";
import { isPaidPlan } from "@/lib/plan";

const PLAN_LABEL: Record<string, string> = { pro: "Pro", plus: "Plus" };

/**
 * Boas-vindas pós-upgrade (#0019): ao detectar a usuária num plano pago e ainda não
 * saudada (flag por plano no localStorage), mostra um toast + um tour rápido das
 * novidades, uma única vez. Como o Asaas não garante o redirect de volta, isso roda
 * no shell do dashboard em vez de depender de um query param.
 */
export function PlanWelcome() {
  const t = useTranslations("plano");
  const { data } = useCurrentUser();
  const [open, setOpen] = useState(false);

  const plan = data?.subscription?.plan;
  const paid = isPaidPlan(plan);

  useEffect(() => {
    if (!plan || !paid || typeof window === "undefined") return;
    const key = `vitrinio:welcomed:${plan}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    toast.success(t("welcomeToast", { plan: PLAN_LABEL[plan] ?? plan }));
    setOpen(true);
  }, [plan, paid, t]);

  if (!plan || !paid) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("welcomeTitle", { plan: PLAN_LABEL[plan] ?? plan })}</DialogTitle>
          <DialogDescription>{t("welcomeDescription")}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• {t("welcomeUnlimited")}</li>
          <li>• {t("welcomeTraffic")}</li>
          <li>• {t("welcomeColors")}</li>
        </ul>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>{t("welcomeCta")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
