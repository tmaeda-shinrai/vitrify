import Link from "next/link";

import { LEGAL_LINKS, RIGHTS_EMAIL } from "@/lib/legal/links";

/**
 * Rodapé com links legais (#0021) reutilizado na landing e no painel. A vitrine
 * pública tem seu próprio rodapé (com "Denunciar"), que também passou a listar
 * estes links — ver `components/vitrine/vitrine-footer.tsx`.
 */
export function LegalFooter({ className }: { className?: string }) {
  return (
    <footer
      className={
        className ??
        "mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-8 text-center text-xs text-muted-foreground"
      }
    >
      {LEGAL_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          {link.label}
        </Link>
      ))}
      <a
        href={`mailto:${RIGHTS_EMAIL}`}
        className="underline-offset-4 hover:text-foreground hover:underline"
      >
        Canal de denúncia
      </a>
    </footer>
  );
}
