import { Flag } from "lucide-react";

/**
 * Rodapé da vitrine pública: assinatura "Feito com Vitrinio" + link "Denunciar"
 * (ponto de entrada para a moderação, #0023). Labels vêm da página (i18n).
 */
export function VitrineFooter({
  madeWithLabel,
  reportLabel,
  reportAria,
  reportHref,
}: {
  madeWithLabel: string;
  reportLabel: string;
  reportAria: string;
  reportHref: string;
}) {
  return (
    <footer className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-2 border-t border-border px-4 py-8 text-center">
      <p className="text-xs text-muted-foreground">{madeWithLabel}</p>
      <a
        href={reportHref}
        aria-label={reportAria}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <Flag className="size-3.5" aria-hidden />
        {reportLabel}
      </a>
    </footer>
  );
}
