import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Package } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProdutosPage() {
  const t = await getTranslations("dashboard");
  return (
    <EmptyState
      icon={Package}
      title={t("productsEmptyTitle")}
      description={t("productsEmptyDescription")}
    />
  );
}
