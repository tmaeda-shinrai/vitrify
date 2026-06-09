import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, Package, Share2, Sparkles, Store } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { VideoEmbed } from "@/components/help/video-embed";
import { PlanComparisonTable } from "@/components/plan/plan-comparison-table";
import { LegalFooter } from "@/components/shared/legal-footer";
import { Button } from "@/components/ui/button";
import { clientEnv } from "@/lib/env";
import { landingFaq } from "@/lib/help/faq";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/" },
    openGraph: { title: t("metaTitle"), description: t("metaDescription"), type: "website" },
    robots: { index: true, follow: true },
  };
}

const STEPS = [
  { icon: Store, key: "step1" },
  { icon: Package, key: "step2" },
  { icon: Share2, key: "step3" },
] as const;

export default async function Home() {
  const t = await getTranslations("landing");
  const faq = landingFaq();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <span className="font-display text-lg font-bold text-brand-primary">
          {clientEnv.NEXT_PUBLIC_APP_NAME}
        </span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t("navLogin")}</Link>
          </Button>
          <Button asChild size="sm" className="bg-brand-primary hover:bg-brand-primary-dark">
            <Link href="/cadastro">{t("navSignup")}</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 pb-16 pt-10 text-center sm:pt-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-4 py-1 text-sm font-medium text-brand-primary">
            <Sparkles className="size-4" aria-hidden />
            {clientEnv.NEXT_PUBLIC_APP_NAME}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl text-lg text-neutral-700">{t("subtitle")}</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-brand-primary text-white hover:bg-brand-primary-dark"
            >
              <Link href="/cadastro">
                {t("cta")}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">{t("heroSecondary")}</Link>
            </Button>
          </div>
          <p className="text-sm text-neutral-500">{t("heroNote")}</p>
        </section>

        {/* Demo */}
        <section className="mx-auto w-full max-w-3xl px-6 py-12">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900">{t("demoTitle")}</h2>
            <p className="mt-1 text-neutral-600">{t("demoSubtitle")}</p>
          </div>
          <VideoEmbed
            youtubeId={clientEnv.NEXT_PUBLIC_INTRO_VIDEO_ID ?? null}
            title={t("demoTitle")}
          />
        </section>

        {/* Como funciona */}
        <section className="bg-white py-16">
          <div className="mx-auto w-full max-w-5xl px-6">
            <h2 className="text-center font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
              {t("stepsTitle")}
            </h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, key }, index) => (
                <li key={key} className="flex flex-col items-center gap-3 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-neutral-900">
                    <span className="text-brand-primary">{index + 1}.</span> {t(`${key}Title`)}
                  </h3>
                  <p className="text-sm text-neutral-600">{t(`${key}Text`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="mx-auto w-full max-w-3xl px-6 py-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
              {t("plansTitle")}
            </h2>
            <p className="mt-1 text-neutral-600">{t("plansSubtitle")}</p>
          </div>
          <PlanComparisonTable highlight="pro" />
          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-brand-primary text-white hover:bg-brand-primary-dark"
            >
              <Link href="/cadastro">{t("plansCta")}</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white py-16">
          <div className="mx-auto w-full max-w-3xl px-6">
            <h2 className="text-center font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
              {t("faqTitle")}
            </h2>
            <ul className="mt-8 divide-y divide-border rounded-lg border border-border">
              {faq.map((item) => (
                <li key={item.id}>
                  <details className="group px-4 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-neutral-900">
                      {item.question}
                      <ChevronDown
                        className="size-4 shrink-0 text-muted-foreground transition group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <p className="mt-2 text-sm text-neutral-600">{item.answer}</p>
                  </details>
                </li>
              ))}
            </ul>
            <div className="mt-6 text-center">
              <Link
                href="/ajuda"
                className="text-sm font-medium text-brand-primary underline underline-offset-4"
              >
                {t("faqAll")}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto w-full max-w-3xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
            {t("finalTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-neutral-600">{t("finalSubtitle")}</p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-brand-primary text-white hover:bg-brand-primary-dark"
          >
            <Link href="/cadastro">
              {t("finalCta")}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
