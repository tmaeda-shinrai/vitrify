# [0003] Schema do banco, triggers e seed de desenvolvimento

|                |                                                                         |
| -------------- | ----------------------------------------------------------------------- |
| **Milestone**  | M0 — Fundação                                                           |
| **Roadmap**    | Fase 1, Semana 1 (parte do schema) e Semana 3 (products e relacionados) |
| **Prioridade** | Must                                                                    |
| **Planos**     | Todos                                                                   |
| **Depende de** | #0002                                                                   |
| **Bloqueia**   | #0004, #0005, #0009, #0010, #0015, #0018                                |

## Contexto

Modelar o banco Postgres 15 (Supabase) conforme `docs/DATABASE.md`. Pode ser entregue em duas migrations (uma com `profiles/vitrines/subscriptions` e triggers, na Semana 1; outra com `products/product_images/categories/brands/order_intents` na Semana 3) ou tudo junto — a issue cobre o schema completo do MVP.

## Escopo

- Migration `initial_schema.sql` (e, se preferir dividir, `products_schema.sql`) criando todas as tabelas de `docs/DATABASE.md` §2:
  - `profiles` (1:1 com `auth.users`), `vitrines` (slug com `CHECK` de formato e `UNIQUE`), `categories`, `brands` (+ tabela seed `suggested_brands`), `products` (preços em **centavos `INT`**, `search_text TSVECTOR GENERATED` com config `portuguese`), `product_images`, `order_intents` (com `ip_hash` e `user_agent_short`), `subscriptions` (enums `subscription_status`, `subscription_plan`), `invoices`, `audit_logs`, `referrals`.
  - Tabelas `coupons` e `coupon_redemptions` (citadas em `docs/PRICING.md` §5.2) — pode ficar para a migration de pagamento (#0018) se preferir; decidir e registrar.
  - Todos os índices listados (incl. `GIN` no `search_text`, índice parcial em produtos ativos, índices de data em `order_intents`).
- Triggers e funções (`docs/DATABASE.md` §3):
  - `handle_new_user()` no `AFTER INSERT ON auth.users` — cria `profile`, `subscription` (`free`/`active`) e `vitrine` inativa com slug `u-<8 chars>`.
  - `set_updated_at()` aplicado a todas as tabelas com `updated_at`.
  - `check_product_limit()` no `BEFORE INSERT ON products` — bloqueia 6º produto no plano `free` (`RAISE EXCEPTION 'PLAN_LIMIT_REACHED'`).
- Geração de tipos TypeScript: `supabase gen types typescript --local > types/supabase.ts`, integrada como script.
- `supabase/seed.sql` (`docs/DATABASE.md` §6): 3 usuárias-exemplo (espelham as personas Mariana/Carla/Joana), 1 vitrine cada com 8–15 produtos, ~30 dias de `order_intents` distribuídos, 1 assinatura Pro ativa.
- Nomenclatura de migrations: `YYYYMMDDHHMMSS_descricao.sql`, append-only, idempotente quando possível.

### Fora de escopo (vai em outra issue)

- Políticas RLS → #0004 (migration separada `rls_policies.sql`)
- Triggers de `audit_logs` (registro automático de ações) → #0021
- Lógica de aplicação que consome o schema

## Tarefas

- [ ] Migration com tabelas `profiles`, `vitrines`, `subscriptions`, `invoices` + enums + índices
- [ ] Migration com `categories`, `brands`, `suggested_brands`, `products`, `product_images`, `order_intents`, `audit_logs`, `referrals` + índices (incl. GIN full-text)
- [ ] Função/trigger `handle_new_user`
- [ ] Função/trigger `set_updated_at` em todas as tabelas aplicáveis
- [ ] Função/trigger `check_product_limit`
- [ ] Seed `suggested_brands` (Avon, Natura, Hinode, Mary Kay, Eudora, O Boticário, Jequiti, Tupperware, etc.)
- [ ] `supabase/seed.sql` com dados realistas das 3 personas
- [ ] Script `pnpm db:types` (gera `types/supabase.ts`)
- [ ] Validar `supabase db push` em local e em staging

## Critérios de aceitação

- [ ] `supabase db push` aplica o schema sem erro em banco limpo
- [ ] Cadastrar um usuário (via Auth) cria automaticamente `profile` + `subscription free` + `vitrine` inativa
- [ ] Inserir o 6º produto numa conta `free` falha com `PLAN_LIMIT_REACHED`; numa conta `pro` funciona
- [ ] `UPDATE` em `products`/`profiles`/`vitrines`/`subscriptions` atualiza `updated_at`
- [ ] Busca full-text em `products.search_text` retorna resultados em português (acentos/stemming)
- [ ] `supabase/seed.sql` popula um ambiente navegável (3 vitrines com produtos e intents)
- [ ] `types/supabase.ts` gerado e usado pelo cliente Supabase tipado

## Referências

- `docs/DATABASE.md` (todo) — §2 tabelas, §3 triggers, §5 migrações, §6 seed
- `docs/SPEC.md` §6 (plano Free 5 produtos)
- `docs/PRICING.md` §5.2 (cupons), §6.3 (inadimplência → estados de subscription)
- `docs/CONTRIBUTING.md` §6 (banco de dados, migrations)
- `docs/ROADMAP.md` Fase 1, Semanas 1 e 3
