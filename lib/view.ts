/**
 * Registro de visualização da vitrine (#0015 PR2) — ping leve no client, **fire-
 * and-forget**, deduplicado por sessão (`sessionStorage`) para não contar reloads.
 * O endpoint `/api/view` incrementa `vitrines.views_count` (com dedup curto por IP).
 */
export function recordVitrineView(slug: string): void {
  try {
    if (typeof window === "undefined") return;
    const key = `vitrine-view:${slug}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");

    const body = JSON.stringify({ slug });
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/view", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // fire-and-forget: nunca bloqueia nem propaga erro.
  }
}
