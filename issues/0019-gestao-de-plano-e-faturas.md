# [0019] Gestão de plano, faturas, inadimplência e cupons

|                |                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Milestone**  | M5 — Pagamento e planos                                                                                                                                                             |
| **Roadmap**    | Fase 3, Semana 10                                                                                                                                                                   |
| **Prioridade** | Must (tela de plano, comparação, aviso de limite, cancelamento self-service, histórico de faturas, garantia 7 dias, comportamento de expiração) · Should (cupons, plano anual -20%) |
| **Planos**     | Free (upgrade), Pro, Plus                                                                                                                                                           |
| **Depende de** | #0010 (gancho do limite), #0018 (Asaas)                                                                                                                                             |

## Contexto

A camada de produto sobre a integração Asaas: como a usuária vê e gerencia o plano, faz upgrade a partir do gatilho de limite, vê faturas, cancela sozinha, e como o sistema se comporta na inadimplência/expiração — **sem nunca apagar dados de produtos** (`docs/PRICING.md` §6.3).

## Escopo

- **Tela de comparação de planos** (Free vs Pro vs Plus, Pro destacado) com exatamente o que muda em cada um (`docs/FEATURES.md` "Divisão por plano", `docs/DESIGN.md` §3 `PlanComparisonTable`, §5.3).
- **Gatilho de upgrade contextual**: ao atingir 5/5 produtos no Free (modal de #0010) ou tentar usar feature paga → leva à comparação → "Assinar Pro – R$ 39/mês" → checkout (#0018) → confirmação via webhook → toast "Bem-vinda ao Pro!" + tour rápido das novidades (`docs/PRICING.md` §5.1, `docs/DESIGN.md` §5.3).
- **Aviso de limite no Free**: "Você tem 5 de 5 produtos. Para mais, faça upgrade." e demais avisos contextuais.
- **Tela "Meu plano"** (`app/(dashboard)/conta` ou subrota): plano atual, período, **upgrade/downgrade** e **cancelamento self-service** (sem falar com suporte — `docs/PRICING.md` §6.1) com pesquisa de saída opcional não-bloqueante.
- **Histórico de faturas** com **download em PDF** (`invoices.invoice_url`).
- **Plano anual com -20%** na UI (Pro R$ 374,40; Plus R$ 662,40) — `Should`.
- **Cupons promocionais** (`Should`): tabelas `coupons`/`coupon_redemptions`, validade e limite global e por usuária; cupons `PRIMEIRA50` (50% off na 1ª mensalidade), `ANUAL30` (30% off no anual), `INDICACAO` (interno) — `docs/PRICING.md` §5.2.
- **Garantia de 7 dias** na primeira assinatura paga (arrependimento — CDC): reembolso integral sem perguntas (`docs/PRICING.md` §6.2).
- **Comportamento de inadimplência/expiração** (`docs/PRICING.md` §6.3): `past_due` mantém a vitrine ativa (graça); 14 dias depois a vitrine pública volta ao limite Free (esconde o excedente, **não apaga**); 30 dias depois cai oficialmente para Free com dados preservados; ao voltar, recupera tudo.
- **E-mails transacionais** relacionados: confirmação de assinatura, fatura, "atualizar dados de pagamento" na inadimplência (sequência D1/D3/D7 — `docs/PRICING.md` §6.3) via Resend.

### Fora de escopo (vai em outra issue)

- Integração Asaas em si (cliente, assinatura, checkout, webhook) → #0018
- Programa de indicação (referrals) → #0020
- NF-e automática → #0024

## Tarefas

- [x] `PlanComparisonTable` (Free/Pro/Plus, Pro destacado) com diferenças
- [x] Fluxo de upgrade a partir do limite/feature paga → comparação → checkout → confirmação → toast + tour das novidades _(comparação + checkout + anual no PR1; toast + tour `PlanWelcome` no PR2)_
- [x] Avisos de limite no Free ("5 de 5", etc.)
- [x] Tela "Meu plano": status/período, upgrade, downgrade, cancelamento self-service + pesquisa de saída opcional _(status/período/upgrade no PR2; cancelamento + pesquisa de saída no PR3)_
- [x] Histórico de faturas com download de PDF
- [x] Opção de plano anual com -20% na UI
- [x] Cupons: tabelas + aplicação no checkout + limites (global/por usuária) + `PRIMEIRA50`/`ANUAL30`/`INDICACAO`
- [x] Garantia de 7 dias (reembolso integral) na 1ª assinatura
- [x] Lógica de inadimplência/expiração: `past_due` (graça) → 14d (volta ao limite Free na vitrine) → 30d (downgrade Free, dados preservados) → reativação restaura tudo
- [x] E-mails: confirmação de assinatura, fatura, sequência de inadimplência (D1/D3/D7) via Resend
- [x] Testes: upgrade Free→Pro libera produto extra; cancelar mantém acesso até fim do período; cupom aplica desconto e respeita limite; inadimplência esconde (não apaga) excedente; reembolso 7 dias

## Critérios de aceitação

- [ ] No Free, atingir 5 produtos abre a comparação; após pagar o Pro, o 6º produto é liberado
- [ ] Cancelar é self-service e mantém o acesso até o fim do período já pago; depois cai para Free
- [ ] Histórico de faturas lista as cobranças com PDF baixável
- [ ] Cupom `PRIMEIRA50` dá 50% na primeira mensalidade e não pode ser usado além do limite configurado
- [ ] Inadimplência nunca apaga produtos — apenas esconde o excedente; ao voltar, tudo retorna
- [ ] Pedido de reembolso dentro de 7 dias da 1ª assinatura é honrado integralmente
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/FEATURES.md` §6 (pagamento e assinatura), "Divisão por plano"
- `docs/PRICING.md` §2 (planos/preços), §5 (estratégia de conversão, cupons, indicação), §6 (cancelamento, reembolso, inadimplência)
- `docs/DESIGN.md` §3 (`PlanComparisonTable`), §5.3 (fluxo de upgrade), §4.4 (feedback)
- `docs/ARCHITECTURE.md` §5.3 (fluxo de pagamento recorrente)
- `docs/DATABASE.md` §2.8 (`subscriptions`, estados), §2.9 (`invoices`), §4.5 (RLS)
- `docs/ROADMAP.md` Fase 3, Semana 10
