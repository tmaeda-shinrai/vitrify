# Issues — Backlog do MVP

Esta pasta quebra a especificação do produto (`docs/SPEC.md`, principalmente §6 _Escopo do MVP_ e §8 _Critérios de pronto_) em issues acionáveis, cruzando com `FEATURES.md`, `ARCHITECTURE.md`, `DATABASE.md`, `DESIGN.md`, `ROADMAP.md`, `PRICING.md` e `LEGAL.md`.

Cada arquivo `NNNN-slug.md` é uma issue auto-contida: contexto, escopo (e o que fica de fora), tarefas, critérios de aceitação e referências aos docs. As issues seguem a ordem de construção do `ROADMAP.md`; respeite o campo **Depende de** antes de começar.

## Convenções

- **Prioridade (MoSCoW):** `Must` = obrigatório no MVP · `Should` = desejável, aceitável adiar para v1.1 · `Could` = v2.
- **Critérios genéricos de aceitação** (de `docs/FEATURES.md`, valem para toda issue de feature, além dos específicos):
  1. Funciona em iOS Safari, Android Chrome e Desktop Chrome/Firefox
  2. Ao menos um teste automatizado cobrindo o caminho feliz
  3. Comportamento definido para erro (rede falhou, dado inválido)
  4. Texto em pt-BR, sem jargão técnico
  5. Acessibilidade básica (contraste AA, foco visível, labels/aria)
  6. Loading state visível em ações de mais de 300ms
- **Definição de pronto de PR** (de `docs/CONTRIBUTING.md`): CI verde (lint, typecheck, testes), screenshot/GIF se mudou UI, sem `console.log`, docs atualizados se mudou comportamento, migration adicionada se mudou schema, PR < ~500 linhas.

## Índice

| #                                                     | Issue                                                               | Milestone                     | Roadmap            | Prioridade    |
| ----------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------- | ------------------ | ------------- |
| [0001](./0001-bootstrap-do-projeto.md)                | Bootstrap do projeto e ferramental                                  | M0 — Fundação                 | Fase 0             | Must          |
| [0002](./0002-infraestrutura-e-ambiente.md)           | Infraestrutura externa e variáveis de ambiente                      | M0 — Fundação                 | Fase 0             | Must          |
| [0003](./0003-schema-do-banco-e-triggers.md)          | Schema do banco, triggers e seed de desenvolvimento                 | M0 — Fundação                 | Fase 1, Sem. 1     | Must          |
| [0004](./0004-politicas-rls.md)                       | Políticas de Row Level Security (RLS)                               | M0 — Fundação                 | Fase 1, Sem. 1     | Must          |
| [0005](./0005-autenticacao-email-senha.md)            | Autenticação por e-mail/senha e recuperação                         | M1 — Conta e autenticação     | Fase 1, Sem. 1     | Must          |
| [0006](./0006-login-com-google.md)                    | Login com Google (OAuth)                                            | M1 — Conta e autenticação     | Fase 1, Sem. 1     | Must          |
| [0007](./0007-shell-do-dashboard.md)                  | Shell do dashboard e navegação mobile                               | M1 — Conta e autenticação     | Fase 1, Sem. 1     | Must          |
| [0008](./0008-onboarding-4-passos.md)                 | Onboarding em 4 passos                                              | M1 — Conta e autenticação     | Fase 1, Sem. 2     | Must          |
| [0009](./0009-perfil-conta-exclusao.md)               | Perfil, conta e exclusão de conta (LGPD)                            | M1 — Conta e autenticação     | Fase 1, Sem. 2     | Must          |
| [0010](./0010-crud-produtos-parte-1.md)               | CRUD de produtos — parte 1 (cadastro, upload, limite)               | M2 — Produtos e vitrine       | Fase 1, Sem. 3     | Must          |
| [0011](./0011-crud-produtos-parte-2.md)               | CRUD de produtos — parte 2 (imagens, categorias, marcas, promo)     | M2 — Produtos e vitrine       | Fase 1, Sem. 4     | Must / Should |
| [0012](./0012-vitrine-publica.md)                     | Vitrine pública `/[slug]` (ISR, header, grid, modal, SEO)           | M2 — Produtos e vitrine       | Fase 2, Sem. 5     | Must          |
| [0013](./0013-botao-pedir-no-whatsapp.md)             | Botão "Pedir no WhatsApp" e WhatsApp flutuante                      | M2 — Produtos e vitrine       | Fase 2, Sem. 5     | Must          |
| [0014](./0014-filtros-busca-compartilhamento.md)      | Filtros, busca, compartilhamento e empty states                     | M2 — Produtos e vitrine       | Fase 2, Sem. 6     | Must / Should |
| [0015](./0015-intencoes-de-pedido.md)                 | Intenções de pedido (`/api/intent` e tela "Pedidos")                | M3 — Pedidos e estatísticas   | Fase 2, Sem. 7     | Must          |
| [0016](./0016-painel-de-estatisticas.md)              | Painel de estatísticas                                              | M3 — Pedidos e estatísticas   | Fase 2, Sem. 7     | Must          |
| [0017](./0017-pwa-instalavel.md)                      | PWA instalável (manifest, service worker, offline)                  | M4 — PWA                      | Fase 2, Sem. 8     | Must / Should |
| [0018](./0018-integracao-asaas.md)                    | Integração Asaas (camada de pagamento, checkout, webhook)           | M5 — Pagamento e planos       | Fase 3, Sem. 9     | Must          |
| [0019](./0019-gestao-de-plano-e-faturas.md)           | Gestão de plano, faturas, inadimplência e cupons                    | M5 — Pagamento e planos       | Fase 3, Sem. 10    | Must / Should |
| [0020](./0020-programa-de-indicacao.md)               | Programa de indicação (referrals)                                   | M5 — Pagamento e planos       | Fase 3, Sem. 10    | Should        |
| [0021](./0021-conformidade-legal-lgpd.md)             | Conformidade legal e LGPD (termos, privacidade, export, audit logs) | M6 — Conformidade e polimento | Fase 3, Sem. 11–12 | Must          |
| [0022](./0022-suporte-e-conteudo.md)                  | Suporte e conteúdo (FAQ, vídeos, tour guiado)                       | M6 — Conformidade e polimento | Fase 3, Sem. 11    | Must / Should |
| [0023](./0023-administracao-interna-e-moderacao.md)   | Administração interna e moderação                                   | M6 — Conformidade e polimento | Fase 3, Sem. 12    | Must          |
| [0024](./0024-polimento-acessibilidade-e2e-backup.md) | Polimento, acessibilidade, E2E e backup                             | M6 — Conformidade e polimento | Fase 3, Sem. 12    | Must          |
| [0025](./0025-beta-fechado-e-lancamento.md)           | Beta fechado com embaixadoras e go-live                             | M7 — Lançamento               | Fase 4, Sem. 13–14 | Must          |

## Mapa SPEC.md → issues

| Item do escopo do MVP (`SPEC.md` §6)                                 | Issues                       |
| -------------------------------------------------------------------- | ---------------------------- |
| Cadastro e autenticação (e-mail/senha + Google)                      | 0005, 0006, 0007, 0008, 0009 |
| Criação de vitrine pública com URL personalizada (slug)              | 0008, 0012                   |
| CRUD de produtos com foto, nome, preço, descrição, categoria e marca | 0010, 0011                   |
| Botão "Pedir no WhatsApp" com mensagem pré-formatada                 | 0013                         |
| Painel da vendedora com estatísticas básicas                         | 0015, 0016                   |
| Plano Free (5 produtos) e plano Pro (ilimitado)                      | 0003 (trigger), 0018, 0019   |
| Cobrança recorrente via PIX/cartão (Asaas)                           | 0018, 0019                   |
| PWA instalável                                                       | 0017                         |
| Infra de base (não citada explicitamente, mas pré-requisito)         | 0001, 0002, 0003, 0004       |

| Critério de pronto do MVP (`SPEC.md` §8)                             | Issues             |
| -------------------------------------------------------------------- | ------------------ |
| Funcionalidades do escopo implementadas e testadas                   | todas + 0024 (E2E) |
| 10 usuárias-piloto validaram por 2 semanas                           | 0025               |
| Política de privacidade, termos de uso, exclusão de conta publicados | 0021               |
| Pagamento recorrente testado em produção (≥5 transações reais)       | 0025               |
| Lighthouse mobile da vitrine > 90                                    | 0017               |
| Backup automático configurado e testado                              | 0024               |
| Documentação de suporte (FAQ + 5 tutoriais em vídeo)                 | 0022               |
