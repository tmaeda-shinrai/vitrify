/**
 * Derivações server-side da intenção de pedido (#0015): origem do tráfego a
 * partir do referrer, categoria de dispositivo a partir do user-agent e hash do
 * IP (LGPD — nunca armazenamos o IP em claro). Módulo de servidor (`node:crypto`).
 */
import { createHash } from "node:crypto";

export type IntentSourceValue =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "tiktok"
  | "google"
  | "direct";

export type DeviceValue = "mobile-ios" | "mobile-android" | "desktop";

/** Origem do tráfego pelo referrer da página. Vazio, mesmo host ou inválido → "direct". */
export function sourceFromReferrer(
  referrer: string | null | undefined,
  appUrl: string,
): IntentSourceValue {
  if (!referrer) return "direct";
  let host: string;
  let appHost: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
    appHost = new URL(appUrl).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  if (host === appHost) return "direct";
  if (/(^|\.)instagram\.com$/.test(host)) return "instagram";
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(host)) return "facebook";
  if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(host)) return "whatsapp";
  if (/(^|\.)tiktok\.com$/.test(host)) return "tiktok";
  if (/(^|\.)google\.[a-z.]+$/.test(host)) return "google";
  return "direct";
}

/** Categoria de dispositivo (sem fingerprinting): 3 valores apenas. */
export function shortUserAgent(ua: string | null | undefined): DeviceValue {
  const value = (ua ?? "").toLowerCase();
  if (/iphone|ipad|ipod/.test(value)) return "mobile-ios";
  if (/android/.test(value)) return "mobile-android";
  return "desktop";
}

/** SHA-256 hex do IP (para dedup sem guardar PII). */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}
