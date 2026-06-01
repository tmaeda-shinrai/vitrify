import { useTranslations } from "next-intl";

/** Divisor "ou" entre o login social e o formulário de e-mail/senha. */
export function OrDivider() {
  const t = useTranslations("auth");
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase text-muted-foreground">{t("orDivider")}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
