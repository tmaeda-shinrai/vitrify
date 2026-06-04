// Scrubbing de PII antes de enviar eventos ao Sentry (#0017, LEGAL §1.8):
// nunca vazar e-mail, telefone/WhatsApp, CPF ou nome da pessoa. Aplicado em
// `beforeSend`/`beforeSendTransaction` nas configs do client, server e edge.
//
// Mantemos stack traces intactos (não scrubamos `exception`) — só limpamos os
// campos que costumam carregar dados informados pela pessoa: user, request,
// message, breadcrumbs e extra.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// Sequências longas de dígitos (telefone BR, CPF) com separadores comuns.
const PHONE_CPF_RE = /(?:\+?\d[\s().-]?){8,}/g;
const REDACTED = "[redacted]";

export function scrubString(value: string): string {
  return value.replace(EMAIL_RE, REDACTED).replace(PHONE_CPF_RE, REDACTED);
}

function scrubDeep(value: unknown): unknown {
  if (typeof value === "string") return scrubString(value);
  if (Array.isArray(value)) return value.map(scrubDeep);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) out[key] = scrubDeep(entry);
    return out;
  }
  return value;
}

// Forma mínima de um evento do Sentry, usada só internamente para o acesso aos
// campos. O parâmetro público é genérico para casar com `ErrorEvent`/
// `TransactionEvent` sem depender dos tipos exportados pelo SDK.
interface ScrubbableShape {
  user?: { email?: unknown; username?: unknown; ip_address?: unknown; geo?: unknown } | null;
  request?: {
    cookies?: unknown;
    headers?: Record<string, unknown>;
    query_string?: unknown;
    data?: unknown;
  } | null;
  message?: string;
  breadcrumbs?: Array<{ message?: string; data?: unknown }> | null;
  extra?: Record<string, unknown>;
}

/**
 * Remove PII de um evento do Sentry, mutando-o no lugar e devolvendo a mesma
 * referência (a API do Sentry espera o evento de volta). Genérico para servir
 * direto como `beforeSend`/`beforeSendTransaction`.
 */
export function scrubEvent<T>(event: T): T {
  const e = event as ScrubbableShape;

  if (e.user) {
    delete e.user.email;
    delete e.user.username;
    delete e.user.ip_address;
    delete e.user.geo;
  }

  if (e.request) {
    delete e.request.cookies;
    if (e.request.headers) {
      delete e.request.headers.authorization;
      delete e.request.headers.cookie;
    }
    if (typeof e.request.query_string === "string") {
      e.request.query_string = scrubString(e.request.query_string);
    }
    if (e.request.data !== undefined) {
      e.request.data = scrubDeep(e.request.data);
    }
  }

  if (typeof e.message === "string") {
    e.message = scrubString(e.message);
  }

  if (e.breadcrumbs) {
    for (const crumb of e.breadcrumbs) {
      if (typeof crumb.message === "string") crumb.message = scrubString(crumb.message);
      if (crumb.data) crumb.data = scrubDeep(crumb.data);
    }
  }

  if (e.extra) {
    e.extra = scrubDeep(e.extra) as Record<string, unknown>;
  }

  return event;
}
