import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { VitrineExplorer } from "@/components/vitrine/vitrine-explorer";
import { VitrineFooter } from "@/components/vitrine/vitrine-footer";
import { VitrineHeader } from "@/components/vitrine/vitrine-header";
import { VitrineJsonLd } from "@/components/vitrine/vitrine-jsonld";
import { VitrineViewTracker } from "@/components/vitrine/vitrine-view-tracker";
import { VitrineWhatsappFab } from "@/components/vitrine/vitrine-whatsapp-fab";
import { defaultLocale } from "@/i18n";
import { clientEnv } from "@/lib/env";
import { cn } from "@/lib/utils";
import { buildVitrineMetadata, themeModeClass, themePrimaryVars } from "@/lib/vitrine";
import {
  getActiveVitrineSlugs,
  getPublicVitrine,
  getVitrineModerationState,
} from "@/lib/vitrine-data";

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

export default async function VitrinePage({ params }: { params: { slug: string } }) {
  setRequestLocale(defaultLocale);

  const vitrine = await getPublicVitrine(params.slug);
  if (!vitrine) {
    // Distingue vitrine bloqueada (mensagem neutra) de inexistente (404) — #0023.
    if ((await getVitrineModerationState(params.slug)) === "blocked") {
      const tBlocked = await getTranslations("vitrine");
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
          <h1 className="font-display text-2xl text-foreground">{tBlocked("blockedTitle")}</h1>
          <p className="max-w-sm text-sm text-muted-foreground">{tBlocked("blockedDescription")}</p>
        </main>
      );
    }
    notFound();
  }

  const t = await getTranslations("vitrine");
  const reportHref = `/denunciar?vitrine=${encodeURIComponent(vitrine.slug)}`;
  const vitrineUrl = `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${vitrine.slug}`;

  return (
    <div
      className={cn("min-h-dvh bg-background text-foreground", themeModeClass(vitrine.themeMode))}
      style={themePrimaryVars(vitrine.themePrimary) as React.CSSProperties}
    >
      <VitrineJsonLd vitrine={vitrine} appUrl={clientEnv.NEXT_PUBLIC_APP_URL} />
      <VitrineViewTracker slug={vitrine.slug} />
      <VitrineHeader vitrine={vitrine} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <VitrineExplorer
          products={vitrine.products}
          whatsapp={vitrine.owner.whatsapp}
          ownerName={vitrine.owner.fullName}
          vitrineUrl={vitrineUrl}
          slug={vitrine.slug}
        />
      </main>
      <VitrineFooter
        madeWithLabel={t("madeWith", { name: clientEnv.NEXT_PUBLIC_APP_NAME })}
        reportLabel={t("report")}
        reportAria={t("reportAria")}
        reportHref={reportHref}
      />
      <VitrineWhatsappFab
        whatsapp={vitrine.owner.whatsapp}
        ownerName={vitrine.owner.fullName}
        slug={vitrine.slug}
        label={t("askQuestion")}
      />
    </div>
  );
}
