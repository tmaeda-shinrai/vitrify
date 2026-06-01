import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { serverEnv } from "@/lib/env";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * Limite de tentativas de login: 5 por 15 min por IP (ARCHITECTURE §6.4).
 * Fora de produção as vars do Upstash são opcionais (lib/env.ts); quando ausentes
 * usamos um fallback no-op que sempre permite, para dev/CI seguirem funcionando.
 */
const loginRatelimit =
  serverEnv.UPSTASH_REDIS_REST_URL && serverEnv.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: new Redis({
          url: serverEnv.UPSTASH_REDIS_REST_URL,
          token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
        }),
        limiter: Ratelimit.slidingWindow(5, "15 m"),
        prefix: "ratelimit:login",
        analytics: false,
      })
    : null;

export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  if (!loginRatelimit) return { success: true, remaining: 5 };
  const { success, remaining } = await loginRatelimit.limit(ip);
  return { success, remaining };
}

/** Extrai o IP do cliente a partir dos headers de proxy (Vercel). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "0.0.0.0";
}
