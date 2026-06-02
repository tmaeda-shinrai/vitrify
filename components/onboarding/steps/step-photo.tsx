"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Info, UserRound } from "lucide-react";
import { toast } from "sonner";

import { completeOnboardingAction, saveAvatarAction } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";

export function StepPhoto({ googleAvatarUrl }: { googleAvatarUrl: string | null }) {
  const t = useTranslations("onboarding");
  const [useGoogle, setUseGoogle] = useState(Boolean(googleAvatarUrl));
  const [submitting, setSubmitting] = useState(false);

  async function finish() {
    setSubmitting(true);
    const avatar = useGoogle ? googleAvatarUrl : null;
    const saved = await saveAvatarAction(avatar);
    if (!saved.ok) {
      setSubmitting(false);
      toast.error(saved.error);
      return;
    }
    // Redireciona em caso de sucesso; só retorna aqui em caso de erro.
    const result = await completeOnboardingAction();
    setSubmitting(false);
    if (!result.ok) toast.error(result.error);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        {googleAvatarUrl && useGoogle ? (
          <Image
            src={googleAvatarUrl}
            alt=""
            width={80}
            height={80}
            className="size-20 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound className="size-9" />
          </div>
        )}

        {googleAvatarUrl ? (
          <button
            type="button"
            onClick={() => setUseGoogle((v) => !v)}
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            {useGoogle ? t("photoRemove") : t("photoUseGoogle")}
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">{t("photoNone")}</p>
        )}
      </div>

      <div className="flex gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>{t("usagePolicy")}</p>
      </div>

      <Button type="button" className="w-full" onClick={finish} disabled={submitting}>
        {t("finish")}
      </Button>
    </div>
  );
}
