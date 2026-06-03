# [0016] Painel de estatísticas

|                |                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Milestone**  | M3 — Pedidos e estatísticas                                                               |
| **Roadmap**    | Fase 2, Semana 7                                                                          |
| **Prioridade** | Must (views, cliques, top produtos) · Should (gráfico temporal, origem do tráfego — Pro+) |
| **Planos**     | Todos (origem do tráfego e gráficos: Pro+)                                                |
| **Depende de** | #0010 (produtos), #0015 (order_intents/views)                                             |

## Contexto

A tela "Estatísticas" do painel — o "painel da vendedora com estatísticas básicas" do escopo do MVP (`docs/SPEC.md` §6). Mede engajamento da vendedora e do cliente final; também alimenta os gatilhos de upgrade ("após 100 visualizações na vitrine" — `docs/PRICING.md` §5.1).

## Escopo

- Tela `app/(dashboard)/estatisticas`:
  - **Visualizações da vitrine**: total + últimos 7 dias + últimos 30 dias (`docs/FEATURES.md` §4).
  - **Cliques por produto** (intents): ranking dos produtos mais procurados (top N).
  - **Gráfico temporal** simples de visitas/cliques nos últimos 7 e 30 dias (`Should`; gráficos pequenos no painel — lazy-load do componente de gráfico, `docs/ARCHITECTURE.md` §7.2).
  - **Origem do tráfego** (referrer: Instagram, WhatsApp, link direto, etc.) — `Should`, exibido para **Pro+**; no Free, mostrar como recurso bloqueado com CTA de upgrade.
- `StatCard` reutilizável (`docs/DESIGN.md` §3) para os números principais.
- Queries agregadas eficientes sobre `order_intents` (índices de data já existem; considerar materialized view `vitrine_stats` no futuro — `docs/DATABASE.md` §8).
- `EmptyState` quando ainda não há dados ("compartilhe sua vitrine para começar a ver visitas").
- Gancho de upgrade: ao bater 100 visualizações, oferecer Pro (e-mail/push entram em outras issues; aqui o sinal/evento).

### Fora de escopo (vai em outra issue)

- Registro dos dados (intents/views) → #0015
- Exportação de relatórios em CSV (Plus) → backlog v1.1
- Notificações push de novos cliques (Pro+) → backlog v2
- Dashboard interno de métricas de produto (DAU/MAU/funil) → #0023

## Tarefas

> Entregue em 2 PRs. **PR1 — núcleo Must** (esta entrega): StatCards (views total/7d/30d
> e cliques 7/30d), ranking de cliques por produto, `EmptyState`, abas Pedidos↔Estatísticas
> e helpers/testes. **PR2 — Should:** gráfico temporal lazy (SVG), origem do tráfego (Pro+)
> e gancho de 100 views.
>
> **Decisões (planejamento):** a #0015 só gravava o contador `vitrines.views_count`, sem
> data por evento; por isso as janelas de views vêm de uma nova tabela rollup diária
> **`vitrine_daily_stats`** (views+cliques/dia, fuso America/Sao_Paulo), mantida por RPC
> (views) e trigger (cliques) — DATABASE §2.14/§3.4. Gráfico em **SVG próprio** (sem dep,
> lazy via `next/dynamic`). Como o bottom nav mobile é fixo em 4 ícones (DESIGN §4.2),
> o acesso mobile à tela é via **abas cruzadas** com Pedidos (`SectionTabs`).

- [x] Tela "Estatísticas" com `StatCard`s: views totais / 7d / 30d (+ cliques 7/30d) — PR1
- [x] Ranking de cliques por produto (top N) — PR1
- [x] Gráfico temporal de 7 e 30 dias (componente lazy-loaded, SVG próprio) — PR2
- [x] Origem do tráfego (Pro+) com bloqueio + CTA de upgrade no Free — PR2
- [x] Queries agregadas eficientes; `EmptyState` sem dados — PR1
- [x] Evento "atingiu 100 views" disponível para acionar upgrade (`ViewsUpgradeBanner`; consumido em #0019/marketing) — PR2
- [x] Testes: agregações de 7/30 dias corretas; top produtos ordenado; `aggregateSources`/`buildDailySeries` (`lib/stats`); `isPaidPlan` (`lib/plan`); estado bloqueado da origem (Free vê CTA)

## Critérios de aceitação

- [x] A vendedora vê total de visualizações e os números de 7 e 30 dias
- [x] Vê quais produtos receberam mais cliques de pedido
- [x] No plano Pro+, vê a origem do tráfego; no Free, vê o recurso bloqueado com CTA
- [x] Sem dados ainda, vê um `EmptyState` orientando a compartilhar a vitrine
- [x] Gráficos não pesam o bundle inicial do painel (lazy load via `next/dynamic`)
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`) — verificação manual cross-device pendente

## Referências

- `docs/SPEC.md` §5–6 (métricas, escopo: estatísticas básicas)
- `docs/FEATURES.md` §4 (pedidos e analytics — divisão Must/Should/Pro+)
- `docs/DESIGN.md` §3 (`StatCard`, `EmptyState`), §4.2 (aba)
- `docs/ARCHITECTURE.md` §7.2 (lazy load de gráficos), §8 (observabilidade)
- `docs/DATABASE.md` §2.7 (`order_intents`), §8 (materialized view futura)
- `docs/PRICING.md` §5.1 (gatilho: após 100 visualizações)
- `docs/ROADMAP.md` Fase 2, Semana 7
