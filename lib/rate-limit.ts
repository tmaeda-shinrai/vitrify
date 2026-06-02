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

/** Extrai o IP do cliente a partir dos headers de proxy (Vercel). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "0.0.0.0";
}
