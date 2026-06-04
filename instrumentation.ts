// Carrega a config do Sentry conforme o runtime (#0017). Habilitado via
// `experimental.instrumentationHook` no next.config (Next 14).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
