"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateConsentAction } from "@/app/(dashboard)/conta/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * Toggle do consentimento opcional de comunicações de marketing (#0021). Salva
 * otimista; reverte e avisa em erro. Revogável a qualquer momento (LGPD §1.4).
 */
export function MarketingConsent({ initial }: { initial: boolean }) {
  const [optIn, setOptIn] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    setOptIn(next);
    startTransition(async () => {
      const result = await updateConsentAction(next);
      if (!result.ok) {
        setOptIn(!next);
        toast.error(result.error);
        return;
      }
      toast.success("Preferência salva.");
    });
  }

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id="marketingOptIn"
        className="mt-0.5"
        checked={optIn}
        disabled={pending}
        onCheckedChange={(v) => toggle(v === true)}
      />
      <Label htmlFor="marketingOptIn" className="text-sm font-normal leading-snug">
        Quero receber dicas, novidades e convites do programa de indicação por e-mail. E-mails
        essenciais (cobrança, segurança e avisos da conta) são sempre enviados.
      </Label>
    </div>
  );
}
