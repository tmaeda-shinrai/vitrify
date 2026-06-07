import Link from "next/link";
import type { ReactNode } from "react";

import { LegalDocBanner } from "@/components/legal/legal-doc-banner";
import { LEGAL_LINKS } from "@/lib/legal/links";
import { TERMS_VERSION } from "@/lib/legal/version";

/**
 * Casca compartilhada das páginas legais públicas (#0021): título, banner de
 * "em revisão", a versão vigente e a navegação entre os documentos. O conteúdo
 * (cláusulas) é passado como children pela página específica.
 */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="space-y-4">
        <h1 className="font-display text-3xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Versão {TERMS_VERSION} · Última atualização: {updatedAt}
        </p>
        <LegalDocBanner />
      </header>

      <article className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
        {children}
      </article>

      <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm">
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </footer>
    </main>
  );
}

/** Seção numerada de um documento legal: título + corpo. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      <div className="space-y-3 text-muted-foreground">{children}</div>
    </section>
  );
}

/** Lista com marcadores para enumerações (ex.: conteúdo proibido, terceiros). */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
