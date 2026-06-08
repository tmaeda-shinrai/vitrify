import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/components/shared/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("offline");
  return { title: t("metaTitle") };
}

// Fallback exibido pelo service worker (#0017) quando uma página ainda não
// visitada é aberta sem internet. Páginas já visitadas reabrem do cache.
export default async function OfflinePage() {
  const t = await getTranslations("offline");
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState icon={WifiOff} title={t("title")} description={t("description")} />
    </main>
  );
}
