import { Redis } from "@upstash/redis";

import { sendEmail } from "@/lib/email/client";
import { type EmailContent } from "@/lib/email/templates";
import { serverEnv } from "@/lib/env";

/**
 * Alertas operacionais por e-mail (#0024, ARCHITECTURE §8.4). Decisão: só e-mail
 * (sem Slack). Alertamos o que o app controla — falha repetida do webhook do Asaas
 * e health "down". DB p95 / 5xx / Storage>80% são métricas de plataforma e ficam
 * como regras no Sentry/Vercel/Supabase (ver §8.4). Tudo best-effort: nunca lança.
 */

/** Redis compartilhado (mesmo padrão do rate-limit): null sem Upstash → no-op. */
const redis =
  serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: serverEnv.UPSTASH_REDIS_REST_URL,
        token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** Destinatários dos alertas: a lista `ADMIN_EMAILS` (separada por vírgula). */
export function alertRecipients(): string[] {
  return (serverEnv.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

/** Envia um alerta aos admins (um e-mail por destinatário). No-op sem destinatários. */
export async function notifyAdmins(content: EmailContent): Promise<void> {
  for (const to of alertRecipients()) {
    await sendEmail({ to, ...content });
  }
}

export const WEBHOOK_FAILURE_THRESHOLD = 3;

const WEBHOOK_FAILURE_KEY = "alerts:asaas-webhook:failures";
const WEBHOOK_ALERTED_KEY = "alerts:asaas-webhook:alerted";
const WEBHOOK_WINDOW_SECONDS = 3600;

/**
 * Registra uma falha (5xx) do webhook do Asaas e devolve `true` se este é o momento
 * de alertar: atingiu o limiar de falhas seguidas E ainda não alertou nesta janela
 * (dedup, para não spammar a cada reentrega do Asaas). Sem Redis, no-op (`false`).
 */
export async function recordAsaasWebhookFailure(): Promise<boolean> {
  if (!redis) return false;
  const count = await redis.incr(WEBHOOK_FAILURE_KEY);
  await redis.expire(WEBHOOK_FAILURE_KEY, WEBHOOK_WINDOW_SECONDS);
  if (count < WEBHOOK_FAILURE_THRESHOLD) return false;
  const firstAlert = await redis.set(WEBHOOK_ALERTED_KEY, 1, {
    nx: true,
    ex: WEBHOOK_WINDOW_SECONDS,
  });
  return firstAlert === "OK";
}

/** Sucesso do webhook: zera o contador e o flag de alerta. */
export async function clearAsaasWebhookFailures(): Promise<void> {
  if (!redis) return;
  await redis.del(WEBHOOK_FAILURE_KEY, WEBHOOK_ALERTED_KEY);
}
