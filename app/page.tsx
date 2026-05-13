import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";

export default async function Home() {
  const t = await getTranslations("landing");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 py-16">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <span className="rounded-full bg-brand-primary/10 px-4 py-1 text-sm font-medium text-brand-primary">
          Vitrinio
        </span>

        <h1 className="font-display text-3xl text-neutral-900 sm:text-3xl">{t("title")}</h1>

        <p className="text-lg text-neutral-700">{t("subtitle")}</p>

        <Button
          size="lg"
          className="rounded-md bg-brand-primary text-white hover:bg-brand-primary-dark"
        >
          {t("cta")}
        </Button>
      </div>
    </main>
  );
}
