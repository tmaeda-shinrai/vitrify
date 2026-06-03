import { buildVitrineJsonLd, type PublicVitrine } from "@/lib/vitrine";

/**
 * JSON-LD Schema.org da vitrine (Server Component). Escapa `<` para evitar quebrar
 * o `</script>` (anti-XSS) — `JSON.stringify` não escapa esse caractere.
 */
export function VitrineJsonLd({ vitrine, appUrl }: { vitrine: PublicVitrine; appUrl: string }) {
  const json = JSON.stringify(buildVitrineJsonLd(vitrine, appUrl)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
