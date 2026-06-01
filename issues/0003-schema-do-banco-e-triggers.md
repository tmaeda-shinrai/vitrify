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

- [x] Migration com tabelas `profiles`, `vitrines`, `subscriptions`, `invoices` + enums + índices
- [x] Migration com `categories`, `brands`, `suggested_brands`, `products`, `product_images`, `order_intents`, `audit_logs`, `referrals` + índices (incl. GIN full-text)
- [x] Tabelas `coupons` e `coupon_redemptions` (decisão D2 — incluídas na `initial_schema.sql`; doc atualizado em `DATABASE.md` §2.12–2.13)
- [x] Função/trigger `handle_new_user`
- [x] Função/trigger `set_updated_at` em todas as tabelas aplicáveis (profiles, vitrines, products, subscriptions, coupons)
- [x] Função/trigger `check_product_limit`
- [x] Seed `suggested_brands` (Avon, Natura, Hinode, Mary Kay, Eudora, O Boticário, Jequiti, Tupperware, etc.)
- [x] `supabase/seed.sql` com dados realistas das 3 personas
- [x] Script `pnpm db:types` (gera `types/supabase.ts`) + atalhos `db:start`/`db:reset`/`db:push`
- [x] Validar o schema em local (Docker + `supabase start` aplicando migrations + seed; testes de aceite rodados)

## Critérios de aceitação

- [x] Schema aplica sem erro em banco limpo (via `supabase start`/migrations no stack local; 14 tabelas + 3 enums). Push ao Prod fica para a #0004 (junto da RLS)
- [x] Cadastrar um usuário (via Auth) cria automaticamente `profile` + `subscription free` + `vitrine` inativa (slug `u-99999999`, `is_active=false`) — validado
- [x] Inserir o 6º produto numa conta `free` falha com `PLAN_LIMIT_REACHED`; numa conta `pro` funciona — validado
- [x] `UPDATE` em `products` atualiza `updated_at` (mesmo trigger em profiles/vitrines/subscriptions/coupons) — validado
- [x] Busca full-text em `products.search_text` retorna resultados em português (testado "batom" e stemming com plural "hidratantes")
- [x] `supabase/seed.sql` popula um ambiente navegável (3 vitrines ativas, 23 produtos, 23 imagens, 228 intents)
- [x] `types/supabase.ts` gerado (`db:types`, 830 linhas, 14 tabelas tipadas); consumo pelo cliente Supabase tipado fica na #0005

## Status

**Concluída (schema).** Schema, triggers, seeds e scripts escritos e **validados** contra Postgres 17 local (Docker + `supabase start`). Falta só o merge.

### Decisões registradas

- **D1 — Validação via Docker local.** `supabase init` feito (`config.toml`, `project_id = "vitrinio"`); validação canônica por `supabase start` + `db reset` (migrations + seed) + `gen types --local`. O push ao Prod fica agrupado com a #0004 (RLS) para o Prod nunca ficar sem RLS.
- **D2 — Cupons incluídos agora.** `coupons` + `coupon_redemptions` (+ enum `coupon_discount_type`) entraram na `initial_schema.sql`; modelagem documentada em `docs/DATABASE.md` §2.12–2.13.
- Postgres real do projeto é **17.6** (não 15); `major_version = 17` no `config.toml`. Nada no schema é específico de versão. `docs/DATABASE.md` ajustado para "15+".
- Migrations: `initial_schema.sql` (tudo: tabelas, enums, índices incl. GIN, triggers, cupons) + `seed_suggested_brands.sql`. RLS é migration separada na #0004.

### Fronteiras

- Clientes `lib/supabase/server.ts|browser.ts` + middleware tipados → **#0005** (aqui entregamos só `types/supabase.ts`).

### Validação (Docker local, Postgres 17)

Docker instalado nesta máquina (resolvendo o adiamento da #0002) e stack local no ar. Verificado por queries diretas no banco:

- Schema: 14 tabelas + 3 enums aplicados sem erro; seed populado (3 vitrines ativas, 23 produtos, 23 imagens, 228 intents, 22 marcas sugeridas; assinaturas `free×2` + `pro×1`).
- `handle_new_user`: signup de teste criou `profile` + `subscription free/active` + `vitrine` inativa `u-xxxxxxxx`.
- `check_product_limit`: 6º produto no `free` bloqueado com `PLAN_LIMIT_REACHED`; produto extra no `pro` permitido.
- `set_updated_at`: `UPDATE` em `products` alterou `updated_at`.
- Full-text PT: busca "batom" e stemming (plural "hidratantes" casando singular) retornaram resultados.
- `types/supabase.ts` gerado (`pnpm db:types`).

> Observação: o push das migrations ao Supabase Prod foi deixado para a #0004, para o Prod só receber o schema já com as políticas RLS.

## Referências

- `docs/DATABASE.md` (todo) — §2 tabelas, §3 triggers, §5 migrações, §6 seed
- `docs/SPEC.md` §6 (plano Free 5 produtos)
- `docs/PRICING.md` §5.2 (cupons), §6.3 (inadimplência → estados de subscription)
- `docs/CONTRIBUTING.md` §6 (banco de dados, migrations)
- `docs/ROADMAP.md` Fase 1, Semanas 1 e 3
