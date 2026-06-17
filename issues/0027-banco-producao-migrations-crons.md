# [0027] Banco de produção: migrations, crons e Auth

|                |                                            |
| -------------- | ------------------------------------------ |
| **Milestone**  | M7 — Lançamento                            |
| **Roadmap**    | Fase 4 — Lançamento (Semana 13)            |
| **Prioridade** | Must                                       |
| **Planos**     | —                                          |
| **Depende de** | #0026 (serviços de produção provisionados) |

## Contexto

Com o projeto Supabase de produção criado (#0026), esta issue deixa o **banco pronto**: aplica todas as
migrations, garante que os crons agendados (pg_cron + pg_net) tenham os GUCs que precisam para chamar as rotas
`/api/cron/*`, e configura o **Auth de produção** (Site URL, SMTP via Resend, Google OAuth) — que é gerido no
**painel do Supabase**, não pelo `supabase/config.toml` (esse arquivo é só para o stack local).

A memória do projeto registra que o remoto foi sincronizado só até a migration `20260609130000`
(ambassador_program); as duas migrations de NF-e (`20260609140000_nfe.sql`, `20260609141000_nfe_cron.sql`)
ainda precisam entrar.

## Escopo

### Migrations

- `supabase link --project-ref <ref>` no projeto de produção.
- `supabase migration list` para conferir o diff local↔remoto.
- `supabase db push` aplicando até **`20260609141000`** (31 migrations no total). Confirmar que as 2 migrations
  de NF-e entram.
- **Não rodar o seed de desenvolvimento** (`supabase/seed.sql` cria personas fictícias). Atenção: alguns seeds
  rodam como migration — `seed_suggested_brands` e `seed_coupons`. Revisar se os cupons
  (`PRIMEIRA50`/`ANUAL30`/`INDICACAO`) e as marcas sugeridas devem permanecer em produção (provavelmente sim —
  são de marketing/autocomplete) e ajustar janelas/limites de cupom se necessário.
- Verificar no painel que os buckets `avatars` (512KB) e `products` (1MB) foram criados pelas migrations de
  storage, com as policies de leitura pública + escrita do dono.

### Crons (GUCs)

As migrations `*_cron.sql` agendam os jobs via pg_cron + pg_net, mas leem a URL e o secret de **GUCs** do banco.
Executar uma vez no SQL editor:

```sql
ALTER DATABASE postgres SET app.cron_secret       = '<CRON_SECRET>';
ALTER DATABASE postgres SET app.cron_url           = 'https://vitrinio.com.br/api/cron/billing';
ALTER DATABASE postgres SET app.cron_retention_url = 'https://vitrinio.com.br/api/cron/retention';
ALTER DATABASE postgres SET app.cron_health_url    = 'https://vitrinio.com.br/api/cron/health';
ALTER DATABASE postgres SET app.cron_nfe_url       = 'https://vitrinio.com.br/api/cron/nfe';
```

Validar com `SELECT jobname, schedule FROM cron.job;` — esperado: billing `0 9 * * *` (09:00 UTC), retention
`30 9 * * *`, health `*/15 * * * *`, nfe `0 * * * *`. Rotas correspondentes em `app/api/cron/`.

### Auth (painel Supabase)

- **Site URL** = `https://vitrinio.com.br`; **Redirect URLs** = `https://vitrinio.com.br/**`.
- **SMTP** = Resend: host `smtp.resend.com`, porta 465, user `resend`, pass = `RESEND_API_KEY`, sender
  `Vitrinio`, admin = `EMAIL_FROM` (replica o bloco `[auth.email.smtp]` comentado em `supabase/config.toml`).
- **Google** habilitado com client id/secret de #0026; redirect já registrado no Google Cloud.
- `enable_confirmations = true` (confirmação de e-mail obrigatória, como no local).
- Garantir que os templates pt-BR (`supabase/templates/confirmation.html`, `recovery.html`) estão aplicados.

### Fora de escopo

- Deploy do app, env vars na Vercel, webhook Asaas e backup → #0028.
- Ativação do provedor de NF-e (a migration `nfe_cron` é aplicada aqui, mas a emissão só liga em #0029).

## Tarefas

- [ ] `supabase link` no projeto de produção
- [ ] `supabase db push` até `20260609141000` (31 migrations; NF-e incluídas)
- [ ] Seed de dev **não** rodado; decisão sobre cupons/marcas semeados registrada
- [ ] Buckets `avatars`/`products` verificados (existência + policies)
- [ ] GUCs `app.cron_*` definidos; `cron.job` mostra os 4 jobs com schedules corretos
- [ ] Auth: Site URL + Redirect URLs de produção
- [ ] SMTP Resend habilitado no painel; templates pt-BR aplicados
- [ ] Google OAuth habilitado e testado (redirect URI correto)

## Critérios de aceitação

- [ ] `supabase migration list` sem diffs pendentes (local == remoto)
- [ ] `SELECT jobname, schedule FROM cron.job;` lista billing/retention/health/nfe com os horários esperados
- [ ] E-mail de confirmação de cadastro chega via Resend em teste manual
- [ ] Login com Google funciona contra o projeto de produção
- [ ] Nenhum dado de seed de desenvolvimento presente em produção

## Referências

- `supabase/migrations/` (31 arquivos até `20260609141000_nfe_cron.sql`)
- `supabase/config.toml` (referência de Auth/SMTP/Google; bloco `[auth.email.smtp]` comentado)
- `app/api/cron/{billing,retention,health,nfe}/route.ts` (handlers protegidos por `x-cron-secret`)
- `issues/0019-gestao-de-plano-e-faturas.md` (billing_cron), `issues/0021-conformidade-legal-lgpd.md` (retention_cron)
- Memória do projeto: "Pending remote migrations"
