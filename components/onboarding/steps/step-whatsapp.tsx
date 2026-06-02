"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { saveWhatsappAction } from "@/app/onboarding/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { whatsappStepSchema } from "@/lib/validators/onboarding";

/** Formata dígitos (DDD+9) como (67) 99999-9999 para exibição. */
function formatBr(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function StepWhatsapp({
  defaultValue,
  onDone,
}: {
  defaultValue: string;
  onDone: () => void;
}) {
  const t = useTranslations("onboarding");
  // defaultValue vem como E.164 sem + (55DDD...); mostramos só DDD+número.
  const [display, setDisplay] = useState(formatBr(defaultValue.replace(/^55/, "")));
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const localDigits = display.replace(/\D/g, "");
    const e164 = `55${localDigits}`;
    const parsed = whatsappStepSchema.safeParse({ whatsapp: e164 });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("whatsappInvalid"));
      return;
    }
    setError(undefined);
    setSubmitting(true);
    const result = await saveWhatsappAction({ whatsapp: parsed.data.whatsapp });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="whatsapp">{t("whatsappLabel")}</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <span className="pl-3 text-sm text-muted-foreground">+55</span>
          <Input
            id="whatsapp"
            inputMode="numeric"
            autoFocus
            placeholder="(67) 99999-9999"
            value={display}
            onChange={(e) => setDisplay(formatBr(e.target.value))}
            className="border-0 pl-2 focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-invalid={!!error}
          />
        </div>
        <FieldError message={error} />
        <p className="mt-1.5 text-xs text-muted-foreground">{t("whatsappHint")}</p>
      </div>
      <Button type="button" className="w-full" onClick={handleSubmit} disabled={submitting}>
        {t("continue")}
      </Button>
    </div>
  );
}
