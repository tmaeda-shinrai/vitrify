import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { IntentsFeed } from "@/components/pedidos/intents-feed";
import { EmptyState } from "@/components/shared/empty-state";
import { groupIntentsByDay, type OrderIntentItem } from "@/lib/intents";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pedidos" };

export default async function PedidosPage() {
  const t = await getTranslations("pedidos");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS (order_intents_owner_read) já restringe às vitrines da dona.
  const [{ data: rows }, { data: subscription }] = await Promise.all([
    supabase
      .from("order_intents")
      .select("id, source, user_agent_short, created_at, products(name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("subscriptions").select("plan").eq("owner_id", user.id).maybeSingle(),
  ]);

  const intents: OrderIntentItem[] = (rows ?? []).map((row) => ({
    id: row.id,
    productName: row.products?.name ?? null,
    source: row.source,
    device: row.user_agent_short,
    createdAt: row.created_at ?? new Date().toISOString(),
  }));

  const showSource = subscription?.plan === "pro" || subscription?.plan === "plus";

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </header>
      {intents.length === 0 ? (
        <EmptyState icon={Receipt} title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <IntentsFeed groups={groupIntentsByDay(intents)} showSource={showSource} />
      )}
    </div>
  );
}
