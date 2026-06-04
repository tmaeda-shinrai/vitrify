import * as Sentry from "@sentry/nextjs";

import { scrubEvent } from "@/lib/observability/scrub";

// Sentry no browser (#0017). Sem DSN, fica desabilitado (dev/local).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // No client priorizamos captura de erros (sem tracing) para não pesar o
  // bundle da vitrine; performance traces ficam no server. O ajuste fino de
  // bundle (lazy/tree-shake do Sentry) entra na auditoria Lighthouse (#0017 PR4).
  tracesSampleRate: 0,
  // Nunca anexar PII automática (e-mail/ip); o scrubbing remove o que sobrar.
  sendDefaultPii: false,
  beforeSend: (event) => scrubEvent(event),
  beforeSendTransaction: (event) => scrubEvent(event),
});
