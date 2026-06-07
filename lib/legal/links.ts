/**
 * Rotas dos documentos legais públicos (#0021) e e-mails de governança LGPD
 * (`docs/LEGAL.md` §1.6, §2.2). Centralizado para reuso em footers, páginas e
 * formulário de cadastro — uma fonte só para links e canais.
 */

export const LEGAL_ROUTES = {
  termos: "/termos",
  privacidade: "/privacidade",
  cookies: "/cookies",
} as const;

/** E-mail do Encarregado (DPO) — direitos do titular e dúvidas de privacidade. */
export const DPO_EMAIL = "dpo@vitrinio.com.br";

/** E-mail de exercício de direitos LGPD e denúncias de conteúdo/imagem. */
export const RIGHTS_EMAIL = "direitos@vitrinio.com.br";

/** Itens do footer legal, na ordem de exibição. */
export const LEGAL_LINKS = [
  { href: LEGAL_ROUTES.termos, label: "Termos de Uso" },
  { href: LEGAL_ROUTES.privacidade, label: "Privacidade" },
  { href: LEGAL_ROUTES.cookies, label: "Cookies" },
] as const;
