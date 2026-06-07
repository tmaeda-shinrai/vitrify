/**
 * Tutoriais em vídeo curtos (#0022, SPEC §8 — mínimo 5). `youtubeId` configurável;
 * `null` enquanto o vídeo não foi gravado → o card mostra "em breve". Os ids reais
 * entram depois (conteúdo/operacional), sem mudar código.
 */
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  /** YouTube id (não-listado). `null` = ainda não disponível. */
  youtubeId: string | null;
}

export const TUTORIALS: Tutorial[] = [
  {
    id: "cadastrar-produto",
    title: "Como cadastrar um produto",
    description: "Foto, nome e preço em menos de um minuto.",
    youtubeId: null,
  },
  {
    id: "compartilhar-vitrine",
    title: "Como compartilhar sua vitrine",
    description: "Pegue seu link e mande para as clientes.",
    youtubeId: null,
  },
  {
    id: "ver-pedidos",
    title: "Como ver seus pedidos",
    description: "Acompanhe os interesses que chegam pelo WhatsApp.",
    youtubeId: null,
  },
  {
    id: "foto-remover-fundo",
    title: "Como tirar uma boa foto e remover o fundo",
    description: "Deixe seus produtos com cara de catálogo usando o Photoroom.",
    youtubeId: null,
  },
  {
    id: "assinar-pro",
    title: "Como assinar o Pro",
    description: "Produtos ilimitados e mais recursos em poucos toques.",
    youtubeId: null,
  },
];
