import * as Sentry from "@sentry/nextjs";

import { scrubEvent } from "@/lib/observability/scrub";

// Sentry no runtime Edge â middleware e rotas edge (#0017).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // Sem performance tracing (tree-shaken no build) — foco em captura de erros (#0017 PR4).
  tracesSampleRate: 0,
  sendDefaultPii: false,
  beforeSend: (event) => scrubEvent(event),
  beforeSendTransaction: (event) => scrubEvent(event),
});
