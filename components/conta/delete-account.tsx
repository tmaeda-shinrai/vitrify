"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { requestAccountDeletionAction } from "@/app/(dashboard)/conta/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteAccount() {
  const t = useTranslations("conta");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      // Em sucesso a action faz signOut + redirect; só retorna aqui em erro.
      const result = await requestAccountDeletionAction();
      if (result && !result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-4">
      <h3 className="font-medium text-destructive">{t("dangerTitle")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("dangerDescription")}</p>
      <Button type="button" variant="destructive" className="mt-3" onClick={() => setOpen(true)}>
        {t("deleteAccount")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("deleteConfirmDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button type="button" variant="destructive" onClick={confirm} disabled={pending}>
              {pending ? t("deleting") : t("deleteConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
