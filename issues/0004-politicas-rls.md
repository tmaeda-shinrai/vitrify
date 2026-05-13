# [0004] Políticas de Row Level Security (RLS)

|                |                                                                                         |
| -------------- | --------------------------------------------------------------------------------------- |
| **Milestone**  | M0 — Fundação                                                                           |
| **Roadmap**    | Fase 1, Semana 1 (profiles/vitrines/subscriptions) e Semana 3 (products e relacionados) |
| **Prioridade** | Must                                                                                    |
| **Planos**     | Todos                                                                                   |
| **Depende de** | #0003                                                                                   |
| **Bloqueia**   | #0005, #0010, #0012, #0015                                                              |

## Contexto

RLS é a camada de segurança no banco — sem ela, a `anon key` no cliente expõe tudo. Toda tabela com dados de usuário precisa de RLS habilitada e políticas explícitas, conforme `docs/ARCHITECTURE.md` §6.1 e `docs/DATABASE.md` §4. Migration dedicada (`rls_policies.sql`) para ficar fácil de revisar.

## Escopo

- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em todas as tabelas com dados de usuário.
- Políticas (de `docs/DATABASE.md` §4):
  - **`profiles`**: SELECT/UPDATE só do próprio (`auth.uid() = id`).
  - **`vitrines`**: dona faz tudo na própria (`owner_id = auth.uid()`); público faz SELECT de vitrines com `is_active = TRUE`.
  - **`categories` / `brands`**: dona da vitrine gerencia; público lê as de vitrines ativas.
  - **`products`**: dona da vitrine gerencia (`vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = auth.uid())`); público lê `is_active = TRUE` de vitrines `is_active = TRUE`.
  - **`product_images`**: idem produtos (via join no `product_id`).
  - **`order_intents`**: INSERT público (`WITH CHECK (TRUE)`); SELECT só da dona da vitrine. Sem UPDATE/DELETE para usuários.
  - **`subscriptions`**: SELECT só do próprio; **sem** policy de INSERT/UPDATE para usuário (mutável apenas via service role no webhook).
  - **`invoices`**: SELECT só da dona (via join na subscription); escrita via service role.
  - **`audit_logs`**: sem acesso para usuários comuns; leitura só por service role / admin (ver #0023).
  - **`referrals`**: SELECT/INSERT da própria referrer; conversão marcada por service role.
  - **`coupons` / `coupon_redemptions`** (se já existirem): leitura controlada, escrita via service role.
- Convenção de uso no código (documentar em `docs/CONTRIBUTING.md` §2.7 já cobre): service role **só** em route handlers de webhook e admin; nunca no cliente.
- Testes de RLS: suíte que tenta acessos indevidos com a `anon key` e confirma negação (ex.: usuária A não lê produtos da vitrine de B; anônimo não lê produto inativo).

### Fora de escopo (vai em outra issue)

- Schema/tabelas → #0003
- Painel admin que usa service role → #0023

## Tarefas

- [ ] Migration `rls_policies.sql` habilitando RLS e criando todas as políticas acima
- [ ] Revisão dupla das policies (cada uma com `USING` e, quando aplicável, `WITH CHECK`)
- [ ] Testes automatizados de RLS (acesso permitido vs. negado) com `anon key` e com JWT de usuária
- [ ] Documentar a regra "service role só em webhook/admin" (já em CONTRIBUTING; confirmar)

## Critérios de aceitação

- [ ] Com `anon key`: leitura pública só retorna vitrines ativas e produtos ativos de vitrines ativas; INSERT em `order_intents` permitido; qualquer outra escrita negada
- [ ] Usuária autenticada lê/edita apenas seus próprios `profile`, `vitrines`, `products`, `categories`, `brands`, `product_images`, e lê apenas seus `order_intents`, `subscriptions`, `invoices`
- [ ] Tentativa de UPDATE direto em `subscriptions` por usuária é negada
- [ ] Testes de RLS passam no CI

## Referências

- `docs/ARCHITECTURE.md` §6.1 (RLS)
- `docs/DATABASE.md` §4 (políticas RLS, exemplos)
- `docs/CONTRIBUTING.md` §2.7 (acesso ao banco), §4 (segurança)
- `docs/ROADMAP.md` Fase 1, Semanas 1 e 3
