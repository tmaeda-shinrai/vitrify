import Script from "next/script";

import { clientEnv } from "@/lib/env";

/**
 * Carrega o Plausible (cookieless) só quando `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` existe —
 * no-op em dev/local sem a env. O stub `window.plausible` enfileira eventos custom
 * disparados antes do script terminar de carregar (ver `lib/analytics/plausible`).
 * O script padrão também rastreia as navegações client-side do App Router (pushState).
 */
export function PlausibleScript() {
  const domain = clientEnv.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <>
      <Script
        defer
        data-domain={domain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}`}
      </Script>
    </>
  );
}
