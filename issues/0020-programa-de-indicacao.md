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

- Cada usuária tem um **código/link de indicação** (`referrals.code`, ex.: `vitrinio.com.br?ref=maria123`) — gerar no cadastro ou sob demanda.
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

- [x] Geração de `code`/link de indicação por usuária <!-- PR1: profiles.referral_code + ensure_referral_code; PR3: link no painel -->
- [x] Captura de `?ref=` no cadastro → cria `referrals` (referrer/referred) <!-- PR1: cookie no middleware + trigger (e-mail) / apply_referral (OAuth) -->
- [x] Bônus de 30 dias de Pro para a indicada <!-- PR1: handle_new_user semeia pro/trialing +30d -->
- [x] Ao a indicada assinar Pro+: marca `converted_at`, concede 1 mês grátis ao referrer (`reward_granted`), via service role <!-- PR2: webhook -->
- [x] Painel simples de indicações no perfil (pendentes/convertidas/recompensas) <!-- PR3: /conta/indicacoes -->
- [x] E-mail aos 30 dias + banner no painel (Pro+) — integra com #0019 <!-- PR3: nudge no cron + ReferralGate -->
- [x] Anti-abuso (sem auto-indicação; 1 recompensa por conversão real; e-mail verificado) <!-- PR1/PR2: guards no trigger/RPC + idempotência converted_at; recompensa só em pagamento real (login exige e-mail confirmado) -->
- [x] Testes: indicada com `ref` ganha 30d Pro; conversão da indicada concede 1 mês ao referrer; auto-indicação bloqueada <!-- normalizeReferralCode/decideReferralReward/summarizeReferrals + cron/painel; fluxos de DB/webhook validados manualmente (Supabase remoto) -->

> **Status:** implementada em 3 PRs sequenciais — PR1 (modelo + captura), PR2 (motor de recompensas), PR3 (painel + nudge).

## Critérios de aceitação

- [x] Usuária Pro+ tem um link de indicação; quem se cadastra por ele entra com 30 dias de Pro
- [x] Quando a indicada assina Pro+, a indicadora recebe 1 mês grátis na próxima fatura (uma única vez)
- [x] O perfil mostra o status das indicações (pendentes/convertidas/recompensas)
- [x] Auto-indicação e abusos triviais são bloqueados
- [x] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §6 (programa de afiliados: versão simples no MVP)
- `docs/FEATURES.md` §6 (programa de indicação "traga uma amiga")
- `docs/PRICING.md` §5.3 (programa de indicação), §5.2 (cupom `INDICACAO`)
- `docs/GTM.md` §3.3 (programa de indicação, comunicação)
- `docs/DATABASE.md` §2.11 (`referrals`)
- `docs/ROADMAP.md` Fase 3 Semana 10 / Fase 5 curto prazo
