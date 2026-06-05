import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ContaTabs } from "@/components/conta/conta-tabs";
import { ReferralGate } from "@/components/conta/referral-gate";
import { ReferralPanel } from "@/components/conta/referral-panel";
import { clientEnv } from "@/lib/env";
import { isPaidPlan } from "@/lib/plan";
import { referralStatus, summarizeReferrals } from "@/lib/referrals";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Indicações" };

/**
 * Painel de indicações (#0020 PR3). Pro+ vê o link compartilhável + status das
 * indicações; Free vê o gate de upgrade. O código é gerado sob demanda na 1ª visita
 * (RPC `ensure_referral_code`, idempotente). Lista lida via RLS `referrals_select_own`.
 */
export default async function IndicacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("owner_id", user.id)
    .maybeSingle();

  const t = await getTranslations("indicacoes");

  let content: React.ReactNode;
  if (!isPaidPlan(subscription?.plan)) {
    content = <ReferralGate />;
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .maybeSingle();

    let code = profile?.referral_code ?? null;
    if (!code) {
      const { data } = await supabase.rpc("ensure_referral_code");
      code = data ?? null;
    }

    const { data: rows } = await supabase
      .from("referrals")
      .select("id, converted_at, reward_granted, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    const referrals = rows ?? [];

    content = (
      <ReferralPanel
        link={`${clientEnv.NEXT_PUBLIC_APP_URL}?ref=${code ?? ""}`}
        summary={summarizeReferrals(referrals)}
        items={referrals.map((r) => ({
          id: r.id,
          createdAt: r.created_at,
          status: referralStatus(r),
        }))}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
      <ContaTabs />
      {content}
    </div>
  );
}
