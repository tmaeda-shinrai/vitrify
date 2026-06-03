import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { serverEnv } from "@/lib/env";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * Cliente Redis compartilhado. Fora de produção as vars do Upstash são opcionais
 * (lib/env.ts); quando ausentes usamos `null` e cada limiter cai num fallback no-op
 * que sempre permite, para dev/CI seguirem funcionando.
 */
const redis =
  serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: serverEnv.UPSTASH_REDIS_REST_URL,
        token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/** Login: 5 tentativas por 15 min por IP (ARCHITECTURE §6.4). */
const loginRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      prefix: "ratelimit:login",
      analytics: false,
    })
  : null;

/** Criação de produtos: 30 req/min por usuária (ARCHITECTURE §6.4). */
const productWriteRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "ratelimit:products",
      analytics: false,
    })
  : null;

/** Intent público: 10 req/min por IP (ARCHITECTURE §6.4). */
const intentRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "ratelimit:intent",
      analytics: false,
    })
  : null;

/** View pública: 60 req/min por IP (guarda de abuso; dedup real é por sessão+IP). */
const viewRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "ratelimit:view",
      analytics: false,
    })
  : null;

export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  if (!loginRatelimit) return { success: true, remaining: 5 };
  const { success, remaining } = await loginRatelimit.limit(ip);
  return { success, remaining };
}

export async function checkProductWriteRateLimit(userId: string): Promise<RateLimitResult> {
  if (!productWriteRatelimit) return { success: true, remaining: 30 };
  const { success, remaining } = await productWriteRatelimit.limit(userId);
  return { success, remaining };
}

export async function checkIntentRateLimit(ip: string): Promise<RateLimitResult> {
  if (!intentRatelimit) return { success: true, remaining: 10 };
  const { success, remaining } = await intentRatelimit.limit(ip);
  return { success, remaining };
}

/**
 * Dedup curto da intenção: `true` na 1ª vez na janela, `false` se repetida. Sem
 * Redis (dev/CI) sempre permite. Evita inflar o contador em recliques rápidos.
 */
export async function markIntentOnce(key: string, windowSeconds = 60): Promise<boolean> {
  if (!redis) return true;
  const result = await redis.set(`intent:dedup:${key}`, 1, { nx: true, ex: windowSeconds });
  return result === "OK";
}

export async function checkViewRateLimit(ip: string): Promise<RateLimitResult> {
  if (!viewRatelimit) return { success: true, remaining: 60 };
  const { success, remaining } = await viewRatelimit.limit(ip);
  return { success, remaining };
}

/** Dedup de view por IP+vitrine (janela longa); sem Redis sempre permite. */
export async function markViewOnce(key: string, windowSeconds = 1800): Promise<boolean> {
  if (!redis) return true;
  const result = await redis.set(`view:dedup:${key}`, 1, { nx: true, ex: windowSeconds });
  return result === "OK";
}

/** Extrai o IP do cliente a partir dos headers de proxy (Vercel). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "0.0.0.0";
}
