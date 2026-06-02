import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { User } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Conta" };

export default async function ContaPage() {
  const t = await getTranslations("dashboard");
  return (
    <EmptyState
      icon={User}
      title={t("accountEmptyTitle")}
      description={t("accountEmptyDescription")}
    />
  );
}
