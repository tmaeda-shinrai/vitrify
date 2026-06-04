"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  cancelSubscriptionAction,
  refundFirstPaymentAction,
} from "@/app/(dashboard)/conta/plano/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CancelInput } from "@/lib/validators/cancel";

interface Props {
  canceled: boolean;
  canRefund: boolean;
}

const REASONS: NonNullable<CancelInput["reason"]>[] = ["price", "usage", "changed_mind", "other"];

/**
 * Ações de "Meu plano" (#0019): cancelamento self-service (com pesquisa de saída
 * opcional) e reembolso da garantia de 7 dias. Chama as Server Actions e dá refresh.
 */
export function PlanActions({ canceled, canRefund }: Props) {
  const t = useTranslations("plano");
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [reason, setReason] = useState<CancelInput["reason"]>(undefined);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelSubscriptionAction({ reason, comment: comment || undefined });
      if (!result.ok) {
        toast.error(result.error ?? t("cancel.error"));
        return;
      }
      toast.success(t("cancel.done"));
      setCancelOpen(false);
      router.refresh();
    });
  }

  function handleRefund() {
    startTransition(async () => {
      const result = await refundFirstPaymentAction();
      if (!result.ok) {
        toast.error(result.error ?? t("refund.error"));
        return;
      }
      toast.success(t("refund.done"));
      setRefundOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {canRefund ? (
        <Button variant="outline" onClick={() => setRefundOpen(true)}>
          {t("refund.cta")}
        </Button>
      ) : null}
      {!canceled ? (
        <Button variant="ghost" className="text-destructive" onClick={() => setCancelOpen(true)}>
          {t("cancel.cta")}
        </Button>
      ) : null}

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancel.title")}</DialogTitle>
            <DialogDescription>{t("cancel.description")}</DialogDescription>
          </DialogHeader>

          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">{t("cancel.surveyLegend")}</legend>
            {REASONS.map((r) => (
              <label
                key={r}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
                  reason === r ? "border-primary ring-1 ring-primary" : "border-input",
                )}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  className="sr-only"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
                {t(`cancel.reasons.${r}`)}
              </label>
            ))}
            <Label htmlFor="cancel-comment" className="sr-only">
              {t("cancel.commentLabel")}
            </Label>
            <Textarea
              id="cancel-comment"
              rows={2}
              placeholder={t("cancel.commentPlaceholder")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={300}
            />
          </fieldset>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)} disabled={pending}>
              {t("cancel.back")}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={pending}>
              {pending ? t("cancel.submitting") : t("cancel.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("refund.title")}</DialogTitle>
            <DialogDescription>{t("refund.description")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRefundOpen(false)} disabled={pending}>
              {t("refund.back")}
            </Button>
            <Button onClick={handleRefund} disabled={pending}>
              {pending ? t("refund.submitting") : t("refund.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
