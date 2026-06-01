/** Caminho padrão pós-autenticação. */
export const DEFAULT_REDIRECT = "/dashboard";

/**
 * Garante que um `next` vindo de query string seja um caminho interno seguro
 * (evita open redirect). Aceita só caminhos começando com "/" e não "//".
 */
export function sanitizeNext(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return DEFAULT_REDIRECT;
}
