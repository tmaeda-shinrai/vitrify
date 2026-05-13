# [0020] Programa de indicação (referrals)

|                |                                                                          |
| -------------- | ------------------------------------------------------------------------ |
| **Milestone**  | M5 — Pagamento e planos                                                  |
| **Roadmap**    | Fase 3, Semana 10 / Fase 5 (curto prazo)                                 |
| **Prioridade** | Should (versão simples no MVP; painel completo é v2 — `docs/SPEC.md` §6) |
| **Planos**     | Pro, Plus (quem indica); indicada ganha 30 dias de Pro                   |
| **Depende de** | #0003 (`referrals`), #0018/#0019 (assinaturas/cupons)                    |

## Contexto

Revendedoras de venda direta vivem de indicação — "é a língua nativa delas" (`docs/PRICING.md` §5.3). Versão simples no MVP: link de indicação, recompensa automática quando a indicada vira pagante.

## Escopo

- Cada usuária tem um **código/link de indicação** (`referrals.code`, ex.: `vitri.app?ref=maria123`) — gerar no cadastro ou sob demanda.
- Captura do `ref` no cadastro da indicada → cria registro `referrals` ligando `referrer_id`/`referred_id`.
- Recompensa (`docs/PRICING.md` §5.3):
  - **Indicada**: ganha **30 dias de Pro grátis** em vez de cair direto no Free.
  - **Quem indica** (precisa estar em Pro+): quando a indicada **assina Pro+**, ganha **1 mês grátis** aplicado na próxima fatura → marca `referrals.converted_at` e `reward_granted` (via service role, integrado ao webhook/processo de #0018).
- **Painel de indicações** simples no perfil: quantas pendentes / convertidas / recompensas concedidas (`docs/GTM.md` §3.3). Painel completo com gamificação fica para v2.
- Comunicação (coordenar com #0019/marketing): e-mail aos 30 dias de cadastro "indique uma amiga e ganhe um mês"; banner no painel para quem está em Pro+ (`docs/GTM.md` §3.3).
- Anti-abuso: 1 recompensa por indicada que de fato converte; evitar auto-indicação; respeitar verificação de e-mail.
- Cupom interno `INDICACAO` (1 mês grátis) usado internamente, não público — coordena com #0019.

### Fora de escopo (vai em outra issue)

- Acordo formal com embaixadoras (que é um programa à parte, não o referral genérico) → #0025
- Tabelas/integração de cupons → #0019
- Painel de afiliados completo com gamificação → backlog v2

## Tarefas

- [ ] Geração de `code`/link de indicação por usuária
- [ ] Captura de `?ref=` no cadastro → cria `referrals` (referrer/referred)
- [ ] Bônus de 30 dias de Pro para a indicada
- [ ] Ao a indicada assinar Pro+: marca `converted_at`, concede 1 mês grátis ao referrer (`reward_granted`), via service role
- [ ] Painel simples de indicações no perfil (pendentes/convertidas/recompensas)
- [ ] E-mail aos 30 dias + banner no painel (Pro+) — integra com #0019
- [ ] Anti-abuso (sem auto-indicação; 1 recompensa por conversão real; e-mail verificado)
- [ ] Testes: indicada com `ref` ganha 30d Pro; conversão da indicada concede 1 mês ao referrer; auto-indicação bloqueada

## Critérios de aceitação

- [ ] Usuária Pro+ tem um link de indicação; quem se cadastra por ele entra com 30 dias de Pro
- [ ] Quando a indicada assina Pro+, a indicadora recebe 1 mês grátis na próxima fatura (uma única vez)
- [ ] O perfil mostra o status das indicações (pendentes/convertidas/recompensas)
- [ ] Auto-indicação e abusos triviais são bloqueados
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §6 (programa de afiliados: versão simples no MVP)
- `docs/FEATURES.md` §6 (programa de indicação "traga uma amiga")
- `docs/PRICING.md` §5.3 (programa de indicação), §5.2 (cupom `INDICACAO`)
- `docs/GTM.md` §3.3 (programa de indicação, comunicação)
- `docs/DATABASE.md` §2.11 (`referrals`)
- `docs/ROADMAP.md` Fase 3 Semana 10 / Fase 5 curto prazo
