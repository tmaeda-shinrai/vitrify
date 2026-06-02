/** Formato do slug — espelha o CONSTRAINT slug_format de vitrines (DATABASE §2.2). */
export const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{2,39}$/;

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 40;

/**
 * Slugs reservados — rotas da aplicação e termos sensíveis. Bloqueados antes do
 * INSERT/UPDATE (ARCHITECTURE §6.5). Mantenha em sincronia com as rotas de nível
 * raiz de `app/`.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "dashboard",
  "login",
  "logout",
  "cadastro",
  "recuperar-senha",
  "redefinir-senha",
  "onboarding",
  "produtos",
  "pedidos",
  "estatisticas",
  "conta",
  "checkout",
  "assinar",
  "suporte",
  "ajuda",
  "sobre",
  "termos",
  "privacidade",
  "contato",
  "blog",
  "www",
  "vitrinio",
  "static",
  "_next",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/**
 * Gera um slug candidato a partir de um nome: minúsculas, sem acentos, espaços e
 * símbolos viram hífen. Pode ficar mais curto que o mínimo — quem chama trata.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos (diacríticos combinantes)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH);
}

/** Sugestões de slug a partir do nome (base + variações com sufixo numérico). */
export function suggestSlugs(name: string, count = 3): string[] {
  const base = slugify(name);
  if (base.length < SLUG_MIN_LENGTH) return [];
  const suggestions = [base];
  for (let i = 1; suggestions.length < count + 1; i++) {
    const suffix = `-${i}`;
    suggestions.push(`${base.slice(0, SLUG_MAX_LENGTH - suffix.length)}${suffix}`);
  }
  return suggestions.filter((s) => SLUG_REGEX.test(s) && !isReservedSlug(s)).slice(0, count);
}
