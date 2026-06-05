"use client";

import { Gift, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { ShareButton } from "@/components/shared/share-button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReferralStatus, ReferralSummary } from "@/lib/referrals";

interface ReferralItem {
  id: string;
  createdAt: string | null;
  status: ReferralStatus;
}

interface Props {
  link: string;
  summary: ReferralSummary;
  items: ReferralItem[];
}

const STATUS_VARIANT: Record<ReferralStatus, "default" | "secondary" | "outline"> = {
  rewarded: "default",
  converted: "secondary",
  pending: "outline",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Painel de indicações (#0020 PR3) — só renderizado para Pro+ (gating na página).
 * Mostra o link compartilhável, contadores e a lista **anonimizada** (o RLS de
 * `profiles` não expõe o nome de quem foi indicada; mostramos só status + data).
 */
export function ReferralPanel({ link, summary, items }: Props) {
  const t = useTranslations("indicacoes");

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("yourLink")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-md bg-muted px-3 py-2 text-sm" title={link}>
            {link}
          </code>
          <ShareButton
            url={link}
            label={t("shareLabel")}
            title={t("shareTitle")}
            className="shrink-0"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("stats.pending")} value={summary.pending} icon={Users} />
        <StatCard label={t("stats.converted")} value={summary.converted} icon={Sparkles} />
        <StatCard label={t("stats.rewarded")} value={summary.rewarded} icon={Gift} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <EmptyState icon={Users} title={t("emptyTitle")} description={t("emptyDescription")} />
          ) : (
            <ul className="divide-y">
              {items.map((item, index) => (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{t("item", { n: items.length - index })}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[item.status]}>{t(`status.${item.status}`)}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
