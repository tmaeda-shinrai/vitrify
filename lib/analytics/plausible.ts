/**
 * Eventos do funil de conversão (#0025) enviados ao Plausible — privacy-first e sem
 * cookies (alinhado ao cookieless do #0021). No-op no servidor e quando o script não
 * está carregado (sem `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`). A segmentação por canal de
 * origem é nativa do Plausible: referrer/UTM do visitante são herdados pelo evento.
 *
 * Mapa do funil (`docs/GTM.md` §5):
 *   landing → /cadastro → /onboarding → /produtos → /assinar  (pageviews automáticos)
 *   + metas: `Signup`, `Onboarding completed`, `Product created` (prop `total`),
 *     `Subscription active` (prop `plan`).
 */

export type FunnelEvent =
  | "Signup"
  | "Onboarding completed"
  | "Product created"
  | "Subscription active";

type EventProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProps; callback?: () => void }) => void;
  }
}

export function trackEvent(event: FunnelEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}
