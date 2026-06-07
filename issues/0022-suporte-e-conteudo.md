# [0022] Suporte e conteúdo (FAQ, vídeos, tour guiado)

|                |                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Milestone**  | M6 — Conformidade e polimento                                                                                                        |
| **Roadmap**    | Fase 3, Semana 11                                                                                                                    |
| **Prioridade** | Must (FAQ com busca, tutorial em vídeo no 1º acesso, chat de suporte via WhatsApp) · Should (tour guiado, central de ajuda completa) |
| **Planos**     | Todos (suporte prioritário é Plus)                                                                                                   |
| **Depende de** | #0007 (shell), #0008 (onboarding)                                                                                                    |
| **Bloqueia**   | #0025 (lançamento exige FAQ + 5 tutoriais)                                                                                           |

## Contexto

Atende ao critério de pronto do MVP "Documentação de suporte básica publicada (FAQ + 5 tutoriais em vídeo curto)" (`docs/SPEC.md` §8) e à seção 7 de `docs/FEATURES.md`. O público tem pouca familiaridade técnica — suporte humano via WhatsApp nos 3 primeiros meses é parte da estratégia de adoção (`docs/SPEC.md` §7 mitigações).

## Escopo

- **FAQ com busca** (`/ajuda` ou `/faq`): mínimo **20 perguntas** no lançamento, com busca por texto; em pt-BR, linguagem que conversa (`docs/DESIGN.md` §1.3).
- **Tutoriais em vídeo curtos (60–90s cada)**, mínimo 5: "como cadastrar produto", "como compartilhar vitrine", "como ver pedidos", "como tirar foto de produto / remover fundo (Photoroom)" (`docs/DESIGN.md` §2.6), "como assinar o Pro". Hospedagem leve (YouTube não-listado / Bunny / Mux — decidir).
- **Tutorial em vídeo embutido no primeiro acesso** (60s) — após o onboarding (`docs/FEATURES.md` §7).
- **Tour guiado dentro do app** no primeiro acesso (`Should`): destaca bottom nav, "adicionar produto", "compartilhar vitrine".
- **Chat de suporte via WhatsApp**: botão/links de contato no app (atendimento humano nos 3 primeiros meses).
- **Suporte prioritário** como diferencial do Plus (`Could` — sinalizar na comparação de planos).
- Central de ajuda completa fica para v1.1.

### Fora de escopo (vai em outra issue)

- Páginas legais (`/termos`, `/privacidade`) → #0021
- Landing page de lançamento e conteúdo de marketing (posts, press release) → #0025
- Tabela de comparação de planos → #0019

## Tarefas

- [x] Página de FAQ com busca; redigir ≥ 20 perguntas/respostas em pt-BR — PR1 (`/ajuda`, 24 perguntas, `lib/help/faq.ts`)
- [~] Gravar/editar ≥ 5 vídeos tutoriais curtos; definir hospedagem; incorporar no app — PR1: estrutura/embeds prontos (YouTube não-listado + facade, `lib/help/tutorials.ts`); **gravação dos vídeos é operacional → #0025**
- [~] Vídeo de 60s embutido no primeiro acesso (pós-onboarding) — PR2: `WelcomeTour` embute o vídeo via `NEXT_PUBLIC_INTRO_VIDEO_ID`; **gravar o vídeo → #0025**
- [x] Tour guiado no primeiro acesso (passos sobre nav/adicionar produto/compartilhar) — PR2: card de boas-vindas com 3 dicas/CTAs (decisão: card em vez de spotlight)
- [x] Botão/links de suporte via WhatsApp no app — PR1 (`SupportCta`, `NEXT_PUBLIC_SUPPORT_WHATSAPP`)
- [x] Sinalizar "suporte prioritário" no Plus — já existia (`lib/plan-features.ts`, `prioritySupport`)
- [x] Testes: busca da FAQ retorna resultados; tour aparece só no 1º acesso e pode ser pulado

## Critérios de aceitação

- [x] FAQ publicada com ≥ 20 perguntas e busca funcionando
- [~] ≥ 5 tutoriais em vídeo curtos disponíveis e acessíveis no app — estrutura/embeds no app; vídeos a gravar (#0025)
- [~] Primeiro acesso mostra o vídeo introdutório e o tour guiado (puláveis) — card + embed prontos; vídeo intro a gravar (#0025)
- [x] Há um caminho claro para falar com o suporte via WhatsApp
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §7 (mitigação: onboarding guiado, suporte humano), §8 (FAQ + 5 tutoriais)
- `docs/FEATURES.md` §7 (suporte e comunicação)
- `docs/DESIGN.md` §1.3 (linguagem), §2.6 (tutorial de remover fundo), §4.1 (onboarding)
- `docs/GTM.md` §6.1 (materiais de lançamento — tutoriais)
- `docs/ROADMAP.md` Fase 3, Semana 11
