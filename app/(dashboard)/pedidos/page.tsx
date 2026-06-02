import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Receipt } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Pedidos" };

export default async function PedidosPage() {
  const t = await getTranslations("dashboard");
  return (
    <EmptyState
      icon={Receipt}
      title={t("ordersEmptyTitle")}
      description={t("ordersEmptyDescription")}
    />
  );
}
