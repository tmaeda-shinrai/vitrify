import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

/** 404 amigável da vitrine pública: slug inexistente ou vitrine inativa (#0012). */
export default async function VitrineNotFound() {
  const t = await getTranslations("vitrine");
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm font-medium text-brand-primary">404</p>
      <h1 className="font-display text-2xl text-foreground">{t("notFoundTitle")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("notFoundDescription")}</p>
      <Button asChild className="mt-2">
        <Link href="/">{t("notFoundBack")}</Link>
      </Button>
    </main>
  );
}
