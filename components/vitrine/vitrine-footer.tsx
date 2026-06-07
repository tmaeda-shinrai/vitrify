import { Flag } from "lucide-react";

import { LEGAL_LINKS } from "@/lib/legal/links";

/**
 * Rodapé da vitrine pública: assinatura "Feito com Vitrinio", links legais (#0021)
 * e link "Denunciar" (ponto de entrada para a moderação, #0023). Labels da
 * assinatura/denúncia vêm da página (i18n); os links legais usam LEGAL_LINKS.
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
    <footer className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-3 border-t border-border px-4 py-8 text-center">
      <p className="text-xs text-muted-foreground">{madeWithLabel}</p>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {LEGAL_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </a>
        ))}
        <a
          href={reportHref}
          aria-label={reportAria}
          className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground hover:underline"
        >
          <Flag className="size-3.5" aria-hidden />
          {reportLabel}
        </a>
      </nav>
    </footer>
  );
}
