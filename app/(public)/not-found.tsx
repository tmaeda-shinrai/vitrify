import Link from "next/link";

import { Button } from "@/components/ui/button";

/** 404 amigável da vitrine pública: slug inexistente ou vitrine inativa (#0012). */
export default function VitrineNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm font-medium text-brand-primary">404</p>
      <h1 className="font-display text-2xl text-foreground">Vitrine não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O link pode estar incorreto ou a vitrine não está mais ativa.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
