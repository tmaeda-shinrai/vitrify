/**
 * Registro da intenção de pedido (#0013) — disparo client, **não-bloqueante**, no
 * mesmo clique que abre o WhatsApp (o usuário não espera a resposta). O endpoint
 * `/api/intent`, a persistência, o rate limit e o hash de IP são da #0015; aqui só
 * disparamos e engolimos qualquer erro (até lá, a chamada dá 404 silencioso).
 */
export type IntentSource = "card" | "modal" | "floating";

export interface OrderIntentPayload {
  slug: string;
  productId?: string;
  source: IntentSource;
}

export function recordOrderIntent(payload: OrderIntentPayload): void {
  try {
    const body = JSON.stringify(payload);
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
