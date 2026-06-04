"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

// Captura erros de render não tratados do App Router e os reporta ao Sentry
// (#0017). Substitui o html/body porque roda acima do root layout.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="font-display text-lg font-semibold">Algo deu errado</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tivemos um problema inesperado. Tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Recarregar
          </button>
        </main>
      </body>
    </html>
  );
}
