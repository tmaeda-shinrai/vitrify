# [0015] Intenções de pedido (`/api/intent` e tela "Pedidos")

| | |
|---|---|
| **Milestone** | M3 — Pedidos e estatísticas |
| **Roadmap** | Fase 2, Semana 7 |
| **Prioridade** | Must |
| **Planos** | Todos (origem do tráfego é Pro+) |
| **Depende de** | #0003, #0004, #0012, #0013 |
| **Bloqueia** | #0016 (estatísticas usam intents) |

## Contexto

A "moeda" do produto: cada clique no botão "Pedir no WhatsApp" vira um registro em `order_intents` — é o que valida a vitrine para a vendedora e é a North Star metric (`docs/SPEC.md` §5: "vitrines ativas com pelo menos um clique de pedido nos últimos 30 dias"). Captura acontece **antes** de redirecionar para o WhatsApp, sem bloquear o usuário (`docs/ARCHITECTURE.md` §5.2).

## Escopo

- **Endpoint `POST /api/intent`** (público) recebendo: `vitrine_slug`, `product_id` (opcional, para o flutuante geral), e dados de origem (referrer → `source` como `instagram`/`whatsapp`/`direct`/etc., user-agent resumido em `mobile-android`/`mobile-ios`/`desktop`, timestamp). Resolve `vitrine_id` pelo slug e insere em `order_intents` sem esperar resposta para liberar o cliente.
- **LGPD**: armazenar **SHA-256 do IP** (`ip_hash`), nunca o IP; user-agent resumido a poucas categorias para evitar fingerprinting (`docs/DATABASE.md` §2.7, `docs/LEGAL.md` §1.5).
- **Rate limit**: 10 req/min por IP no `/api/intent` (`docs/ARCHITECTURE.md` §6.4) via Upstash; deduplicação simples por `ip_hash` + `product_id` em janela curta para não inflar.
- Incrementar contadores: `products.intents_count` (e `views_count` quando aplicável) e `vitrines.views_count` — definir estratégia (trigger, RPC ou update no endpoint) sem virar gargalo.
- **Tela "Pedidos"** no painel (`app/(dashboard)/pedidos`): feed das intenções agrupadas por dia, mostrando produto, horário, origem (Pro+) e tipo de dispositivo; `EmptyState` quando ainda não há pedidos; explicar que o registro é a intenção, não o pedido fechado (que acontece no WhatsApp).
- Notificações push de novos cliques ficam para v2 (depende de PWA bem rodada) — fora do MVP.
- Contagem de **visualizações da vitrine**: registrar view (com cuidado para não contar bots/reloads; pode usar evento leve no client + endpoint, ou Plausible — decidir e registrar).

### Fora de escopo (vai em outra issue)

- Gráficos e agregações de estatísticas (views/cliques/top produtos, 7/30 dias) → #0016
- Origem detalhada do tráfego como feature destacada (Pro+) → presente aqui no dado; UI rica é Should
- Push notifications → backlog v2

## Tarefas

- [ ] `POST /api/intent`: valida payload (Zod), resolve `vitrine_id` por slug, insere `order_intent` (não-bloqueante para o cliente)
- [ ] Hash SHA-256 do IP; user-agent resumido a 3 categorias; `source` a partir do referrer
- [ ] Rate limit 10/min por IP; deduplicação curta por `ip_hash`+`product_id`
- [ ] Incremento de `intents_count`/`views_count` (estratégia escolhida e documentada)
- [ ] Registro de visualização da vitrine pública (estratégia escolhida)
- [ ] Tela "Pedidos": feed agrupado por dia, produto + horário + origem + dispositivo, `EmptyState`
- [ ] Integração com o `WhatsAppButton` (#0013): dispara o intent no mesmo clique
- [ ] Testes: intent persiste com `ip_hash` (nunca IP cru); rate limit barra excesso; feed agrupa por dia; clique no botão gera 1 intent

## Critérios de aceitação

- [ ] Clicar "Pedir no WhatsApp" cria um registro em `order_intents` sem atrasar a abertura do WhatsApp
- [ ] `order_intents` nunca contém o IP em claro — apenas o hash; user-agent só nas categorias previstas
- [ ] 11ª chamada do mesmo IP em 1 min é barrada
- [ ] A vendedora vê os pedidos no painel, agrupados por dia, com o produto e o horário
- [ ] North Star calculável: dá para saber se uma vitrine teve ≥1 intent nos últimos 30 dias
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §5 (North Star e métricas)
- `docs/FEATURES.md` §4 (pedidos e analytics)
- `docs/ARCHITECTURE.md` §5.2 (fluxo de pedido via WhatsApp), §6.4 (rate limiting)
- `docs/DATABASE.md` §2.7 (`order_intents`, hash de IP), §4.4 (RLS), §8 (otimizações futuras)
- `docs/LEGAL.md` §1.3, §1.5 (IP hash, retenção 12 meses), §3.2 (logs do Marco Civil)
- `docs/DESIGN.md` §4.2 (aba "Pedidos"), §3 (`EmptyState`)
- `docs/ROADMAP.md` Fase 2, Semana 7
