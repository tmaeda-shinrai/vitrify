import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Sem conexão" };

// Fallback exibido pelo service worker (#0017) quando uma página ainda não
// visitada é aberta sem internet. Páginas já visitadas reabrem do cache.
export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <EmptyState
        icon={WifiOff}
        title="Você está sem conexão"
        description="Não foi possível carregar esta página agora. As vitrines que você já visitou continuam disponíveis offline — reconecte para ver o conteúdo mais recente."
      />
    </main>
  );
}
