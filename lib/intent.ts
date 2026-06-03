/**
 * Registro da intenção de pedido (#0013/#0015) — disparo client, **não-bloqueante**,
 * no mesmo clique que abre o WhatsApp. O endpoint `/api/intent` (#0015) resolve o
 * `vitrine_id` pelo slug, deriva a origem do tráfego do `referrer`, calcula o hash
 * do IP e o user-agent resumido. Aqui só disparamos e engolimos qualquer erro.
 */
export interface OrderIntentPayload {
  slug: string;
  productId?: string;
}

export function recordOrderIntent(payload: OrderIntentPayload): void {
  try {
    const body = JSON.stringify({
      ...payload,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/intent", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // fire-and-forget: nunca bloqueia nem propaga erro ao usuário.
  }
}
