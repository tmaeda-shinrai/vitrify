import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CheckoutForm, type CheckoutPlanOption } from "@/components/checkout/checkout-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/money";
import { getPlanEntry } from "@/lib/payments";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Assinar" };

const PAID_PLANS = ["pro", "plus"] as const;

export default async function AssinarPage({ searchParams }: { searchParams?: { plan?: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const t = await getTranslations("assinar");

  const options: CheckoutPlanOption[] = PAID_PLANS.map((plan) => {
    const entry = getPlanEntry(plan, "monthly");
    return {
      plan,
      name: t(`plans.${plan}.name`),
      description: t(`plans.${plan}.description`),
      priceLabel: t("perMonth", { price: formatBRL(entry.valueCents) }),
    };
  });

  const defaultPlan = searchParams?.plan === "plus" ? "plus" : "pro";

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("formTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm options={options} defaultPlan={defaultPlan} />
        </CardContent>
      </Card>
    </div>
  );
}
