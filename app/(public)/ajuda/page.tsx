import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { FaqSection } from "@/components/help/faq-section";
import { SupportCta } from "@/components/help/support-cta";
import { VideoEmbed } from "@/components/help/video-embed";
import { LEGAL_LINKS } from "@/lib/legal/links";
import { TUTORIALS } from "@/lib/help/tutorials";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ajuda");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
  };
}

export default async function AjudaPage() {
  const t = await getTranslations("ajuda");
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-10">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </header>

      <FaqSection />

      <section className="space-y-4">
        <h2 className="font-display text-xl text-foreground">{t("tutorialsTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {TUTORIALS.map((tutorial) => (
            <article key={tutorial.id} className="space-y-2">
              <VideoEmbed youtubeId={tutorial.youtubeId} title={tutorial.title} />
              <h3 className="text-sm font-medium text-foreground">{tutorial.title}</h3>
              <p className="text-sm text-muted-foreground">{tutorial.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-border bg-muted/30 p-5">
        <h2 className="font-display text-xl text-foreground">{t("supportTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("supportText")}</p>
        <SupportCta />
      </section>

      <footer className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </footer>
    </main>
  );
}
