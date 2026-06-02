import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Estatísticas" };

export default async function EstatisticasPage() {
  const t = await getTranslations("dashboard");
  return (
    <EmptyState
      icon={BarChart3}
      title={t("statsEmptyTitle")}
      description={t("statsEmptyDescription")}
    />
  );
}
