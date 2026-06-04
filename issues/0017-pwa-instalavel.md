# [0017] PWA instalável (manifest, service worker, offline)

|                 |                                                                                       |
| --------------- | ------------------------------------------------------------------------------------- |
| **Milestone**   | M4 — PWA                                                                              |
| **Roadmap**     | Fase 2, Semana 8                                                                      |
| **Prioridade**  | Must (manifest + service worker básico, instalável) · Should (cache offline, atalhos) |
| **Planos**      | Todos                                                                                 |
| **Depende de**  | #0007 (shell), #0012 (vitrine pública)                                                |
| **Relacionada** | #0024 (auditoria Lighthouse final, Sentry)                                            |

## Contexto

Tornar a aplicação um PWA instalável em iOS e Android — um dos itens do escopo do MVP (`docs/SPEC.md` §6) e a justificativa de não fazer app nativo agora (`docs/ARCHITECTURE.md` §2.5). Inclui a auditoria de performance que dá suporte ao critério "Lighthouse mobile da vitrine > 90" (`docs/SPEC.md` §8).

## Escopo

- **`manifest.json`** completo: nome, nome curto, ícones (gerar conjunto de tamanhos a partir de um ícone-fonte), `theme_color`/`background_color` (tokens da marca), `display: standalone`, `start_url`, orientação.
- **Service worker** com `next-pwa` ou **Serwist** (escolher e registrar): estratégia de cache adequada por tipo de recurso.
- **Cache offline da vitrine pública** (somente leitura) — cliente vê a última versão da vitrine mesmo sem internet (`docs/FEATURES.md` §5).
- **Cache do painel da vendedora** (`Should`): mostra a última versão sincronizada quando offline.
- **Compartilhamento via OS Share Sheet** (Web Share API) — coordenar com #0014 (já implementado lá; garantir que funciona instalado).
- **Atalhos do app (shortcuts)** no `manifest.json` (`Should`): "Adicionar produto", "Ver vitrine".
- Banner/affordance de "instalar app" discreto (sem ser intrusivo), respeitando `beforeinstallprompt` no Android e instruções para iOS.
- **Auditoria Lighthouse mobile**: alvo ≥ 90 em performance e acessibilidade na vitrine pública (e bom score no painel); corrigir os ofensores principais (imagens, fontes `display: swap`, JS desnecessário, CLS).
- **Sentry** configurado no app (client + server) com filtro de PII (`docs/ARCHITECTURE.md` §8.3, `docs/LEGAL.md` §1.8 — nunca enviar e-mail/telefone/nome).
- Notificações push web ficam para v2 (Pro+) — fora do MVP.

### Fora de escopo (vai em outra issue)

- Push notifications → backlog v2
- Alertas de observabilidade, health check, backups → #0024
- Stress test de servidor → #0025

## Tarefas

- [x] `manifest.json` + ícones (vários tamanhos) gerados; `theme_color`/`background_color` da marca — PR1 (`app/manifest.ts`, `scripts/generate-icons.mjs`; ícone-fonte monograma temporário em `assets/icon-source.svg`)
- [x] Service worker (**Serwist** `@serwist/next`) registrado; estratégias de cache por recurso (`app/sw.ts`) — PR2
- [x] Cache offline read-only da vitrine pública (`defaultCache` NetworkFirst de páginas/RSC + CacheFirst das imagens do Supabase Storage) — PR2
- [x] Cache da última versão do painel (offline) (`defaultCache`) — PR2
- [x] Atalhos no manifest ("Adicionar produto" → `/produtos?novo=1`; "Ver vitrine" → `/minha-vitrine`) — PR1
- [x] Affordance de instalação (`InstallPrompt`: Android `beforeinstallprompt`; instruções iOS, dispensável) — PR1
- [x] Web Share funcionando com app instalado (`ShareButton` da #0014; standalone usa o Share Sheet do OS)
- [x] Sentry no client e server, com scrubbing de PII (`@sentry/nextjs`; `sentry.{client,server,edge}.config.ts`, `instrumentation.ts`, `app/global-error.tsx`; scrubber puro em `lib/observability/scrub.ts` removendo e-mail/telefone/CPF/usuário; no-op sem DSN) — PR3
- [x] Auditoria Lighthouse mobile + corrigir ofensores — PR4: enxugado o SDK do Sentry no client (`bundleSizeOptimizations`, sem tracing/replay → First Load compartilhado 161→120KB, vitrine 217→182KB); imagens já com `priority`/`sizes`/lazy e `alt` (#0012) e a11y com `aria-label`/`aria-pressed`. Lighthouse mobile da **landing**: performance 100 / acessibilidade 100. _A vitrine pública ≥ 90 é verificada manualmente sobre uma vitrine semeada (não há slug ativo no remoto para auditoria automática); auditoria final é da #0024._
- [x] Testes: instalável (manifest válido — PR1); página de fallback offline (unit + E2E — PR2). _Obs.: o Serwist fica desabilitado em `next dev`, então o offline real da vitrine é verificado manualmente sobre o build de produção._

## Critérios de aceitação

- [x] App é instalável no Android Chrome e no iOS Safari, abrindo em standalone com ícone e cores da marca — PR1 (manifest válido + SW; install em device verificado manualmente)
- [x] Após visitar uma vitrine, ela reabre offline (somente leitura) — PR2 (verificado manualmente sobre build de produção; Serwist desabilitado em dev)
- [x] Atalhos do app levam às telas corretas — PR1 ("Adicionar produto" → `?novo=1`; "Ver vitrine" → `/minha-vitrine`)
- [~] **Lighthouse mobile da vitrine pública ≥ 90** — PR4: ofensores corrigidos e landing 100/100; score da vitrine verificado manualmente / finalizado na #0024 (sem vitrine semeada no remoto para auditoria automática)
- [x] Erros do client/server chegam ao Sentry sem vazar PII — PR3 (`lib/observability/scrub.ts`)
- [x] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §6 (PWA instalável), §8 (Lighthouse > 90)
- `docs/FEATURES.md` §5 (PWA)
- `docs/ARCHITECTURE.md` §2.5 (por que PWA), §3.1 (`next-pwa`/Serwist), §7 (performance), §8.3 (Sentry)
- `docs/DESIGN.md` §4.5 (imagens/performance), §6 (acessibilidade)
- `docs/LEGAL.md` §1.8 (Sentry anonimiza PII), §6 (acessibilidade)
- `docs/ROADMAP.md` Fase 2, Semana 8
