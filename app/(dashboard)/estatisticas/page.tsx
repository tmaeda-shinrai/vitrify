import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, CalendarRange, Eye, MousePointerClick } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionTabs } from "@/components/dashboard/section-tabs";
import { TopProducts } from "@/components/estatisticas/top-products";
import { EmptyState } from "@/components/shared/empty-state";
import { ShareButton } from "@/components/shared/share-button";
import { StatCard } from "@/components/shared/stat-card";
import { clientEnv } from "@/lib/env";
import {
  dateKeyDaysBefore,
  dateKeyInSaoPaulo,
  summarizeStats,
  topProductsByIntents,
  type DailyStatRow,
} from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Estatísticas" };

const TOP_PRODUCTS_LIMIT = 5;
const WINDOW_DAYS = 30;

const ptBR = (value: number) => value.toLocaleString("pt-BR");

export default async function EstatisticasPage() {
  const t = await getTranslations("estatisticas");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vitrine } = await supabase
    .from("vitrines")
    .select("id, slug, views_count")
    .eq("owner_id", user.id)
    .eq("is_default", true)
    .maybeSingle();
  if (!vitrine) redirect("/onboarding");

  const todayKey = dateKeyInSaoPaulo();
  const windowStart = dateKeyDaysBefore(todayKey, WINDOW_DAYS - 1);

  // RLS (daily_stats_owner_read / products) já restringe às vitrines da dona.
  const [{ data: dailyRows }, { data: productRows }] = await Promise.all([
    supabase
      .from("vitrine_daily_stats")
      .select("stat_date, views_count, intents_count")
      .eq("vitrine_id", vitrine.id)
      .gte("stat_date", windowStart)
      .order("stat_date", { ascending: true }),
    supabase
      .from("products")
      .select("id, name, intents_count")
      .eq("vitrine_id", vitrine.id)
      .gt("intents_count", 0)
      .order("intents_count", { ascending: false })
      .limit(TOP_PRODUCTS_LIMIT),
  ]);

  const daily: DailyStatRow[] = (dailyRows ?? []).map((row) => ({
    date: row.stat_date,
    views: row.views_count ?? 0,
    intents: row.intents_count ?? 0,
  }));
  const viewsTotal = vitrine.views_count ?? 0;
  const summary = summarizeStats(daily, viewsTotal, todayKey);
  const topProducts = topProductsByIntents(
    (productRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      intents: row.intents_count ?? 0,
    })),
    TOP_PRODUCTS_LIMIT,
  );

  const hasData = viewsTotal > 0 || summary.intents30d > 0 || topProducts.length > 0;
  const shareUrl = `${clientEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/${vitrine.slug}`;

  return (
    <div className="space-y-6">
      <SectionTabs />
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </header>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={<ShareButton url={shareUrl} label={t("emptyShare")} />}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label={t("viewsTotalLabel")}
              value={ptBR(summary.viewsTotal)}
              hint={t("viewsTotalHint")}
              icon={Eye}
            />
            <StatCard label={t("views7dLabel")} value={ptBR(summary.views7d)} icon={CalendarDays} />
            <StatCard
              label={t("views30dLabel")}
              value={ptBR(summary.views30d)}
              icon={CalendarRange}
            />
            <StatCard
              label={t("intents7dLabel")}
              value={ptBR(summary.intents7d)}
              icon={MousePointerClick}
            />
            <StatCard
              label={t("intents30dLabel")}
              value={ptBR(summary.intents30d)}
              icon={MousePointerClick}
            />
          </div>

          {topProducts.length > 0 ? <TopProducts products={topProducts} /> : null}
        </div>
      )}
    </div>
  );
}
