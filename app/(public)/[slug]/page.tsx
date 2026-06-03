import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { VitrineFooter } from "@/components/vitrine/vitrine-footer";
import { VitrineGrid } from "@/components/vitrine/vitrine-grid";
import { VitrineHeader } from "@/components/vitrine/vitrine-header";
import { defaultLocale } from "@/i18n";
import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { themeModeClass, themePrimaryVars } from "@/lib/vitrine";
import { getActiveVitrineSlugs, getPublicVitrine } from "@/lib/vitrine-data";

/** ISR: cache hit servido do edge; regenera a cada 60s (ARCHITECTURE §5.4). */
export const revalidate = 60;

/** Prebuilda as vitrines ativas; slugs novos renderizam sob demanda e cacheiam. */
export async function generateStaticParams() {
  return (await getActiveVitrineSlugs()).map((slug) => ({ slug }));
}

/** Denúncia: ponto de entrada provisório; fluxo dedicado vem em #0023. */
const REPORT_EMAIL = "suporte@vitrinio.com.br";

export default async function VitrinePage({ params }: { params: { slug: string } }) {
  setRequestLocale(defaultLocale);

  const vitrine = await getPublicVitrine(params.slug);
  if (!vitrine) notFound();

  const t = await getTranslations("vitrine");
  const reportHref = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(
    `Denúncia de vitrine: ${vitrine.slug}`,
  )}`;

  return (
    <div
      className={cn("min-h-dvh bg-background text-foreground", themeModeClass(vitrine.themeMode))}
      style={themePrimaryVars(vitrine.themePrimary) as React.CSSProperties}
    >
      <VitrineHeader vitrine={vitrine} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <VitrineGrid products={vitrine.products} emptyLabel={t("empty")} />
      </main>
      <VitrineFooter
        madeWithLabel={t("madeWith", { name: clientEnv.NEXT_PUBLIC_APP_NAME })}
        reportLabel={t("report")}
        reportAria={t("reportAria")}
        reportHref={reportHref}
      />
    </div>
  );
}
