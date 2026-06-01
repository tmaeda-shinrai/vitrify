"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

const ERROR_KEYS: Record<string, string> = {
  "oauth-cancelado": "errorOauthCancelled",
  oauth: "errorOauth",
  "link-invalido": "errorLinkInvalid",
};

/** Mostra um toast amigável a partir de `?erro=` na URL (OAuth / link inválido). */
export function AuthErrorToast() {
  const searchParams = useSearchParams();
  const erro = searchParams.get("erro");
  const t = useTranslations("auth");
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!erro || shown.current === erro) return;
    const key = ERROR_KEYS[erro];
    if (key) {
      shown.current = erro;
      toast.error(t(key));
    }
  }, [erro, t]);

  return null;
}
