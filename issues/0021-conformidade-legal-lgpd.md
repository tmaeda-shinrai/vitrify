# [0021] Conformidade legal e LGPD (termos, privacidade, export, audit logs)

|                |                                                 |
| -------------- | ----------------------------------------------- |
| **Milestone**  | M6 — Conformidade e polimento                   |
| **Roadmap**    | Fase 3, Semanas 11–12                           |
| **Prioridade** | Must                                            |
| **Planos**     | Todos                                           |
| **Depende de** | #0003 (`audit_logs`), #0009 (exclusão de conta) |
| **Bloqueia**   | #0025 (lançamento exige conformidade pronta)    |

## Contexto

Atende ao critério de pronto do MVP "Política de privacidade, termos de uso e processo de exclusão de conta publicados" (`docs/SPEC.md` §8) e às obrigações de `docs/LEGAL.md` (LGPD, Marco Civil, LBI). Os textos jurídicos finais precisam de revisão por advogado especializado — esta issue cobre o produto/infra ao redor deles e o draft inicial.

## Escopo

- **Páginas legais públicas**: `/termos` (Termos de Uso), `/privacidade` (Política de Privacidade), `/cookies` (se aplicável — recomendado usar Plausible sem cookies e dispensar banner, `docs/LEGAL.md` §5). Conteúdo seguindo as cláusulas obrigatórias de `docs/LEGAL.md` §4.1 e a lista pública de conteúdo proibido (§4.2). Marcado como **draft "a revisar por advogado"** até a revisão jurídica.
- **Aceite dos termos** no cadastro (checkbox + versão aceita registrada); reaceite quando houver mudança material.
- **Cláusula de responsabilidade do usuário sobre imagens/marcas** no aceite e no onboarding (`docs/LEGAL.md` §2.2 camada 1).
- **Tela "Meus dados"** (`docs/LEGAL.md` §1.4): confirmação/acesso aos dados + **export em JSON** (dados pessoais) e **export em CSV/JSON** de produtos (portabilidade).
- **Configurações > Privacidade**: revogação de consentimentos opcionais (marketing, analíticos não-essenciais); transparência sobre terceiros (Resend, Asaas, Supabase, Sentry — `docs/LEGAL.md` §1.3, §1.8).
- **`audit_logs` em uso**: triggers/registro automático de ações sensíveis em `products`, `vitrines`, `profiles` (criação/edição/exclusão de conteúdo público, mudança de plano) com `actor_id`, `action`, `entity_*`, `metadata`, `ip_hash` — atende o Art. 15 do Marco Civil (logs por ≥ 6 meses; retenção configurada em 180 dias com job de limpeza) e §1.7 (resposta a incidentes). `docs/DATABASE.md` §2.10, `docs/LEGAL.md` §3.
- **E-mails de governança**: `dpo@<domínio>` e `direitos@<domínio>` ativos e monitorados (`docs/LEGAL.md` §1.6, §2.2).
- **Página de exclusão de conta** funcionando ponta a ponta (o fluxo é #0009; aqui garantir a documentação do prazo, o e-mail de confirmação e o job de anonimização 30d / exclusão 90d).
- **Retenção de dados** implementada conforme `docs/LEGAL.md` §1.5 (conta excluída: anonimização 30d / exclusão 90d; audit logs 180d; `ip_hash` em `order_intents` 12 meses; dados fiscais 5 anos; backups 90d) — jobs agendados/edge functions de limpeza.
- **`docs/security-incidents.md`** (plano de resposta a incidentes) criado (`docs/LEGAL.md` §1.7).
- Footer do app/vitrine com links para `/termos`, `/privacidade`, `/cookies` e canal de denúncia.

### Fora de escopo (vai em outra issue)

- Sistema de denúncia de vitrine (botão + fluxo admin de remoção em 48h) → #0023
- Acessibilidade WCAG completa (LBI) → #0024 (parte de polimento)
- Constituição da empresa / CNPJ / contador / conta PJ → checklist operacional de #0025 (não é código)

## Tarefas

- [x] Páginas `/termos`, `/privacidade`, `/cookies` (drafts seguindo `LEGAL.md` §4–5; marcadas "a revisar por advogado") — PR1
- [x] Aceite de termos no cadastro (registro de versão) + reaceite em mudança material — PR1 (cadastro) + PR4 (gate no onboarding/OAuth + reaceite na mudança de versão)
- [x] Cláusula de responsabilidade sobre imagens/marcas no aceite e no onboarding — PR1 + PR4
- [x] Tela "Meus dados": acesso + export JSON (pessoais) + export CSV/JSON (produtos) — PR4
- [x] Configurações > Privacidade: revogar consentimentos opcionais; lista de terceiros — PR4
- [x] `audit_logs`: triggers/registro automático de ações sensíveis + job de retenção 180d — PR2
- [~] E-mails `dpo@` e `direitos@` ativos e roteados — referenciados/linkados no código e docs (PR1/PR5); **ativação da caixa/DNS é operacional → checklist #0025**
- [x] Exclusão de conta ponta a ponta: confirmação, e-mail, job de anonimização 30d / exclusão 90d — PR3
- [x] Jobs de retenção: `order_intents` ip_hash 12 meses; demais conforme §1.5 — PR2/PR3 (backups 90d ficam com #0024)
- [x] `docs/security-incidents.md` (plano de resposta a incidentes) — PR5
- [x] Footer com links legais e canal de denúncia — PR1
- [x] Testes: aceite obrigatório no cadastro; export gera arquivo válido; ação sensível gera `audit_log`; pedido de exclusão dispara o fluxo

## Critérios de aceitação

- [x] `/termos` e `/privacidade` publicados e linkados; cadastro exige aceite e registra a versão
- [x] Usuária consegue exportar seus dados pessoais (JSON) e seus produtos (CSV/JSON)
- [x] Ações sensíveis (criar/editar/excluir produto, mudar plano) ficam registradas em `audit_logs` — actor/ação/entidade garantidos por trigger; `ip_hash` confiável no evento `auth.login` e via GUC em transação (per-mutação é best-effort dado o PostgREST stateless)
- [x] "Excluir minha conta" funciona ponta a ponta; prazos de anonimização/exclusão documentados ao usuário
- [~] `dpo@` e `direitos@` recebem e-mails; plano de resposta a incidentes documentado — plano documentado (PR5); recebimento real depende da ativação da caixa (#0025)
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/SPEC.md` §8 (critério: privacidade/termos/exclusão publicados)
- `docs/LEGAL.md` (todo) — §1 (LGPD), §2 (imagens/IP), §3 (Marco Civil/logs), §4 (Termos), §5 (cookies), §8 (checklist pré-lançamento), §9 (documentos a redigir)
- `docs/FEATURES.md` §1 (exclusão de conta)
- `docs/DATABASE.md` §2.10 (`audit_logs`), §7 (retenção)
- `docs/ARCHITECTURE.md` §6 (segurança), §8 (observabilidade)
- `docs/ROADMAP.md` Fase 3, Semanas 11–12
