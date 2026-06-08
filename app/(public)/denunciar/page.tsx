import type { Metadata } from "next";

import { ReportForm } from "@/components/help/report-form";

export const metadata: Metadata = {
  title: "Denunciar vitrine",
  robots: { index: false, follow: false },
};

export default function DenunciarPage({ searchParams }: { searchParams: { vitrine?: string } }) {
  const slug = (searchParams.vitrine ?? "").trim();

  return (
    <main className="mx-auto max-w-md space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="font-display text-2xl text-foreground">Denunciar vitrine</h1>
        <p className="text-sm text-muted-foreground">
          {slug ? (
            <>
              Você está denunciando a vitrine <strong>@{slug}</strong>. Conte o motivo abaixo.
            </>
          ) : (
            "Informe o motivo da denúncia."
          )}
        </p>
      </header>

      {slug ? (
        <ReportForm slug={slug} />
      ) : (
        <p className="text-sm text-destructive">Link de denúncia inválido.</p>
      )}
    </main>
  );
}
