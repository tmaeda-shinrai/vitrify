import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { VitrineFooter } from "@/components/vitrine/vitrine-footer";
import { VitrineGrid } from "@/components/vitrine/vitrine-grid";
import { VitrineHeader } from "@/components/vitrine/vitrine-header";
import { VitrineJsonLd } from "@/components/vitrine/vitrine-jsonld";
import { defaultLocale } from "@/i18n";
import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { buildVitrineMetadata, themeModeClass, themePrimaryVars } from "@/lib/vitrine";
import { getActiveVitrineSlugs, getPublicVitrine } from "@/lib/vitrine-data";

/** ISR: cache hit servido do edge; regenera a cada 60s (ARCHITECTURE §5.4). */
export const revalidate = 60;

/** Prebuilda as vitrines ativas; slugs novos renderizam sob demanda e cacheiam. */
export async function generateStaticParams() {
  return (await getActiveVitrineSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const vitrine = await getPublicVitrine(params.slug);
  if (!vitrine) return { title: "Vitrine não encontrada" };
  return buildVitrineMetadata(vitrine, clientEnv.NEXT_PUBLIC_APP_URL);
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
      <VitrineJsonLd vitrine={vitrine} appUrl={clientEnv.NEXT_PUBLIC_APP_URL} />
      <VitrineHeader vitrine={vitrine} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <VitrineGrid products={vitrine.products} whatsappNumber={vitrine.owner.whatsapp} />
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
