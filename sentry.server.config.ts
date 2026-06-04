import * as Sentry from "@sentry/nextjs";

import { scrubEvent } from "@/lib/observability/scrub";

// Sentry no runtime Node (#0017). Sem DSN, fica desabilitado (dev/local).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeSend: (event) => scrubEvent(event),
  beforeSendTransaction: (event) => scrubEvent(event),
});
