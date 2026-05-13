# [0013] Botão "Pedir no WhatsApp" e WhatsApp flutuante

|                 |                                                       |
| --------------- | ----------------------------------------------------- |
| **Milestone**   | M2 — Produtos e vitrine                               |
| **Roadmap**     | Fase 2, Semana 5                                      |
| **Prioridade**  | Must                                                  |
| **Planos**      | Todos                                                 |
| **Depende de**  | #0012                                                 |
| **Relacionada** | #0015 (o clique também registra a intenção de pedido) |

## Contexto

A ação central da vitrine: levar o cliente até o WhatsApp da vendedora com uma mensagem pronta. "WhatsApp é o destino, não o concorrente" (`docs/SPEC.md` §3). Esta issue cobre o comportamento do botão e da mensagem; o registro da intenção de pedido (`order_intents`) é tratado em #0015 e deve acontecer **no mesmo clique, sem bloquear** o redirecionamento.

## Escopo

- Componente `WhatsAppButton` (`docs/DESIGN.md` §3): botão verde (cor `--whatsapp` `#25D366`), ícone do WhatsApp, presente em **cada produto** (no card e no modal de detalhe).
- Mensagem pré-formatada por produto, em pt-BR, contendo nome do produto, preço (ou preço promocional quando houver) e o link da vitrine. Ex.: `Olá Maria, tenho interesse no produto: Batom Avon Tom 234 — R$ 32,90. Vitrine: vitri.app/maria-silva` (`docs/SPEC.md` §2, `docs/DESIGN.md` §5.2).
- Redirecionamento via `wa.me/{whatsapp}?text={mensagem_url_encoded}` (usa `profiles.whatsapp` em E.164 sem `+`).
- **Botão WhatsApp flutuante geral** na vitrine para dúvidas sem produto específico (mensagem genérica do tipo "Olá {Nome}, vi sua vitrine e queria tirar uma dúvida").
- Produto "esgotado" (`is_available = FALSE`): botão de pedido desabilitado (com tooltip/label "Esgotado"); o flutuante geral continua ativo.
- Disparar, no mesmo handler e de forma não-bloqueante, o `POST /api/intent` (ver #0015) — o usuário não espera a resposta para ser redirecionado.
- Acessibilidade: `aria-label` nos botões-ícone; foco visível.

### Fora de escopo (vai em outra issue)

- Endpoint `/api/intent`, persistência, rate limit, hash de IP, tela "Pedidos" → #0015
- Compartilhamento da vitrine (Web Share) → #0014

## Tarefas

- [ ] `WhatsAppButton` (variante `whatsapp` do Button) reutilizável
- [ ] Geração da mensagem pré-formatada por produto (nome + preço/promo + link da vitrine), URL-encoded
- [ ] Botão no `ProductCard` e no modal de detalhe; desabilitado quando "esgotado"
- [ ] Botão WhatsApp flutuante geral com mensagem genérica
- [ ] Redireciono `wa.me/{whatsapp}?text=...`
- [ ] Chamada não-bloqueante a `POST /api/intent` no mesmo clique (integra com #0015)
- [ ] `aria-label`/foco; teste em iOS Safari e Android Chrome
- [ ] Testes: mensagem gerada corretamente (com e sem promo); botão desabilitado em produto esgotado; abre `wa.me` correto

## Critérios de aceitação

- [ ] Tocar "Pedir no WhatsApp" num produto abre o WhatsApp da vendedora com a mensagem pronta (nome, preço, link)
- [ ] Produto esgotado: botão de pedido desabilitado; flutuante geral ainda funciona
- [ ] O clique registra a intenção (via #0015) sem atrasar a abertura do WhatsApp
- [ ] Funciona em iOS Safari e Android Chrome (deep link `wa.me`)
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §2 (solução, mensagem de exemplo), §3 (princípio "WhatsApp é o destino")
- `docs/FEATURES.md` §2 (botão "Pedir no WhatsApp", botão flutuante)
- `docs/DESIGN.md` §2.1 (cor `--whatsapp`), §3 (`WhatsAppButton`), §5.2 (fluxo do cliente)
- `docs/ARCHITECTURE.md` §5.2 (fluxo de pedido via WhatsApp)
- `docs/DATABASE.md` §2.1 (`profiles.whatsapp`)
- `docs/ROADMAP.md` Fase 2, Semana 5
