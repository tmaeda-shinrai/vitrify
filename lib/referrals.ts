/**
 * Helpers do programa de indicação (#0020). Por ora: o cookie que carrega o
 * `?ref=` da captura (middleware) até o cadastro (e-mail) / callback (OAuth), e a
 * normalização do código. O link de indicação aponta para a raiz do app
 * (`?ref=<code>`), então a captura precisa sobreviver à navegação até o cadastro —
 * daí o cookie. Helpers puros de recompensa entram na PR2.
 */

/** Cookie httpOnly que guarda o código de indicação capturado. */
export const REFERRAL_COOKIE = "vitrinio_ref";

/** Validade curta do cookie (30 min) — folga entre clicar no link e se cadastrar. */
export const REFERRAL_COOKIE_MAX_AGE = 60 * 30;

/**
 * Normaliza um código de indicação cru (querystring/cookie): maiúsculas, sem
 * espaços, só `[A-Z0-9]` de 4 a 20 chars. Retorna `null` se não casar — barra
 * lixo/injeção antes de gravar cookie ou consultar o banco (o lookup real do
 * referrer fica no trigger/RPC, que devolvem no-op para código inexistente).
 */
export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return /^[A-Z0-9]{4,20}$/.test(code) ? code : null;
}
