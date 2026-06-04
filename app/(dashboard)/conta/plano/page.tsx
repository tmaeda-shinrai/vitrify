import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ContaTabs } from "@/components/conta/conta-tabs";
import { PlanActions } from "@/components/plan/plan-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invoiceMethodToken, invoiceStatusVariant } from "@/lib/invoices";
import { formatBRL } from "@/lib/money";
import { isPaidPlan } from "@/lib/plan";
import { isWithinRefundWindow } from "@/lib/refund";
import { createClient } from "@/lib/supabase/server";
import { inferBillingPeriod, SUBSCRIPTION_STATUS_VARIANT } from "@/lib/subscription";

export const metadata: Metadata = { title: "Meu plano" };

const PLAN_NAMES: Record<string, string> = { free: "Free", pro: "Pro", plus: "Plus" };

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function MeuPlanoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, plan, status, current_period_start, current_period_end, canceled_at")
    .eq("owner_id", user.id)
    .maybeSingle();

  const invoices = subscription
    ? ((
        await supabase
          .from("invoices")
          .select(
            "id, amount_cents, status, payment_method, paid_at, due_date, invoice_url, created_at",
          )
          .eq("subscription_id", subscription.id)
          .order("created_at", { ascending: false })
          .limit(50)
      ).data ?? [])
    : [];

  const t = await getTranslations("plano");

  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "active";
  const paid = isPaidPlan(plan);
  const period = inferBillingPeriod(
    subscription?.current_period_start ?? null,
    subscription?.current_period_end ?? null,
  );

  // Janela de reembolso: a 1ª fatura paga (menor paid_at) tem ≤ 7 dias?
  const firstPaidAt =
    invoices
      .filter((i) => i.status === "paid" && i.paid_at)
      .map((i) => i.paid_at as string)
      .sort()[0] ?? null;
  const canRefund = paid && !subscription?.canceled_at && isWithinRefundWindow(firstPaidAt);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <ContaTabs />

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-lg">
            {t("currentPlan", { plan: PLAN_NAMES[plan] ?? plan })}
          </CardTitle>
          <Badge variant={SUBSCRIPTION_STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {paid ? (
            <>
              {period ? <p className="text-muted-foreground">{t(`period.${period}`)}</p> : null}
              {subscription?.canceled_at ? (
                <p>{t("accessUntil", { date: formatDate(subscription.current_period_end) })}</p>
              ) : (
                <p>
                  {t("nextCharge", { date: formatDate(subscription?.current_period_end ?? null) })}
                </p>
              )}
              <Button asChild variant="outline">
                <Link href="/assinar">{t("changePlan")}</Link>
              </Button>
              <PlanActions canceled={!!subscription?.canceled_at} canRefund={canRefund} />
            </>
          ) : (
            <>
              <p className="text-muted-foreground">{t("freeDescription")}</p>
              <Button asChild>
                <Link href="/assinar">{t("seePlans")}</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("invoicesTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noInvoices")}</p>
          ) : (
            <ul className="divide-y">
              {invoices.map((invoice) => {
                const methodToken = invoiceMethodToken(invoice.payment_method);
                const knownStatus = ["paid", "pending", "overdue", "refunded"].includes(
                  invoice.status,
                );
                return (
                  <li
                    key={invoice.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="font-medium">{formatBRL(invoice.amount_cents)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.created_at)}
                        {methodToken ? ` · ${t(`method.${methodToken}`)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={invoiceStatusVariant(invoice.status)}>
                        {knownStatus ? t(`invoiceStatus.${invoice.status}`) : invoice.status}
                      </Badge>
                      {invoice.invoice_url ? (
                        <Button asChild size="sm" variant="ghost">
                          <a href={invoice.invoice_url} target="_blank" rel="noopener noreferrer">
                            <Download className="size-4" />
                            <span className="hidden sm:inline">{t("downloadPdf")}</span>
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
