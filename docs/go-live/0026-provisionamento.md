# Runbook — #0026 Provisionar serviços de produção

> **Objetivo:** criar as contas/projetos **de produção** dos provedores externos e reunir todas as credenciais que
> alimentam [`lib/env.ts`](../../lib/env.ts) / [`.env.example`](../../.env.example) num **gerenciador de segredos**.
> Esta issue **só monta o cofre de segredos** — não faz deploy, não toca no banco, não liga NF-e.
>
> **Decisão de ambiente:** deploy de **produção direto, sem staging** (a tabela de ambientes em
> `docs/ARCHITECTURE.md` §9 ainda cita staging, mas para o MVP só `vitrinio.com.br` é provisionado).

## ⚠️ Segurança (ler antes de começar)

- **Nenhum segredo de servidor** (service role, API keys, webhook secret, senha de banco) pode ir para chat,
  e-mail, screenshot ou commit. Veja `docs/CONTRIBUTING.md` §Security.
- Só variáveis com prefixo **`NEXT_PUBLIC_`** podem chegar ao cliente. Todas as outras são server-only.
- Guarde tudo no **gerenciador de segredos** (1Password / Bitwarden / Vault — o que a equipe usar), nunca em
  `.env.local` versionado.
- **Se algo vazar, rotacione imediatamente** a credencial no painel do provedor.
- Use o checklist do final (§ Template de segredos) para conferir cobertura e marcar progresso.

## Fora de escopo (outras issues)

| Tarefa                                                                       | Issue                                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Aplicar migrations, Auth/SMTP no painel, agendar crons (pg_cron)             | [#0027](../../issues/0027-banco-producao-migrations-crons.md) |
| Lançar env vars na Vercel, associar domínio, registrar webhook Asaas, backup | [#0028](../../issues/0028-deploy-vercel-webhook-backup.md)    |
| Ativar NF-e (`FISCAL_PROVIDER`/`ASAAS_MUNICIPAL_SERVICE_CODE`)               | [#0029](../../issues/0029-nfe-producao.md)                    |
| Empresa/CNPJ e caixas `dpo@`/`direitos@`                                     | [#0030](../../issues/0030-gates-legais-pre-pagamento.md)      |

---

## 1. DNS `vitrinio.com.br`

**Pré-requisito:** domínio já adquirido; acesso ao painel de DNS do registrador.

1. No painel de DNS, aponte o apex/subdomínio para a Vercel (a Vercel informa os alvos ao adicionar o domínio na
   #0028 — tipicamente **A `76.76.21.21`** para o apex e **CNAME `cname.vercel-dns.com`** para `www`).
2. Adicione os registros de **verificação de domínio** que a Vercel pedir.
3. Deixe TTL baixo (300s) durante a migração para propagar rápido.

> A associação domínio ↔ projeto Vercel acontece na **#0028**; aqui só preparamos os registros.

**Coleta:** nenhuma env var (configuração de DNS).

---

## 2. Supabase produção

**Pré-requisito:** organização Supabase; **projeto dedicado** (separado do remoto de dev — sem dados de seed).

1. **New project** → região **South America (São Paulo) — `sa-east-1`** (latência + LGPD).
2. Plano **Pro** (backup nativo 30 dias + image transformation).
3. Defina uma **senha de banco** forte → guarde como `SUPABASE_DB_PASSWORD`.
4. Em **Settings → API**, copie:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (**secreta**) → `SUPABASE_SERVICE_ROLE_KEY`
5. Em **Settings → General**, copie o **Reference ID** → `SUPABASE_PROJECT_REF`.

**Coleta:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`.

---

## 3. Asaas produção

**Pré-requisito:** conta **PJ** verificada no Asaas (ambiente real, **não** sandbox).

1. Use a URL de produção: **`ASAAS_API_URL=https://api.asaas.com/v3`** (o sandbox `https://sandbox.asaas.com/api/v3`
   fica só para dev).
2. Em **Integrações → API**, gere a **API Key de produção** → `ASAAS_API_KEY`.
3. Gere o **webhook secret**: `openssl rand -hex 32` → `ASAAS_WEBHOOK_SECRET` (o mesmo valor é cadastrado no painel
   de webhooks na #0028; nossa rota valida pelo header `asaas-access-token`, não é HMAC do corpo).
4. **Crie os 4 planos (assinaturas-modelo) com os valores EXATOS abaixo.** O webhook identifica o plano fazendo
   **reverse-lookup pelo valor** (`planFromValueCents` em [`lib/payments/plans.ts`](../../lib/payments/plans.ts)) —
   se o valor não bater **exatamente**, a ativação do plano falha silenciosamente.

   | Plano | Ciclo              | Valor         | Env var do ID                |
   | ----- | ------------------ | ------------- | ---------------------------- |
   | Pro   | Mensal (`MONTHLY`) | **R$ 39,00**  | `ASAAS_PLAN_PRO_MONTHLY_ID`  |
   | Pro   | Anual (`YEARLY`)   | **R$ 374,40** | `ASAAS_PLAN_PRO_YEARLY_ID`   |
   | Plus  | Mensal (`MONTHLY`) | **R$ 69,00**  | `ASAAS_PLAN_PLUS_MONTHLY_ID` |
   | Plus  | Anual (`YEARLY`)   | **R$ 662,40** | `ASAAS_PLAN_PLUS_YEARLY_ID`  |

5. Anote o **ID de cada plano** nas env vars correspondentes.

**Coleta:** `ASAAS_API_KEY`, `ASAAS_WEBHOOK_SECRET`, `ASAAS_PLAN_PRO_MONTHLY_ID`, `ASAAS_PLAN_PRO_YEARLY_ID`,
`ASAAS_PLAN_PLUS_MONTHLY_ID`, `ASAAS_PLAN_PLUS_YEARLY_ID`. (E confirme `ASAAS_API_URL` de prod.)

---

## 4. Resend (e-mail transacional)

**Pré-requisito:** acesso ao DNS de `vitrinio.com.br` (§1).

1. Em **Domains → Add Domain**, adicione `vitrinio.com.br`.
2. Crie no DNS os registros de envio que o Resend gerar (**SPF**, **DKIM** e, se oferecido, `MX`/return-path) e
   aguarde a verificação ficar **verde**.
3. Em **API Keys**, gere uma key de produção → `RESEND_API_KEY`.

**Coleta:** `RESEND_API_KEY`, `EMAIL_FROM=Vitrinio <ola@vitrinio.com.br>`,
`EMAIL_REPLY_TO=suporte@vitrinio.com.br`.

---

## 5. Upstash Redis (rate limiting)

**Pré-requisito:** conta Upstash.

1. **Create Database** → tipo **Regional**, região próxima ao Brasil (ex.: `us-east-1` / `sa-east-1` se disponível).
2. Habilite o endpoint **REST**.
3. Copie em **Details → REST API**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**Coleta:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

---

## 6. Sentry (observabilidade)

**Pré-requisito:** organização Sentry.

1. **Create Project** → plataforma **Next.js**, nome **`vitrinio`**.
2. Copie o **DSN** → `NEXT_PUBLIC_SENTRY_DSN`.
3. Em **Settings → Auth Tokens**, gere um token com escopo de **upload de source maps** (`project:releases`) →
   `SENTRY_AUTH_TOKEN`.
4. Anote o slug da organização → `SENTRY_ORG`.

**Coleta:** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT=vitrinio`.

---

## 7. Plausible (analytics sem cookies)

**Pré-requisito:** conta Plausible.

1. **Add a website** → domínio **`vitrinio.com.br`**.
2. Configure as **metas de funil** (já disparadas pelo código): `Signup`, `Onboarding completed`,
   `Product created`, `Subscription active`.

**Coleta:** `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=vitrinio.com.br`.

---

## 8. Google OAuth

**Pré-requisito:** projeto no Google Cloud Console; tela de consentimento OAuth configurada.

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → tipo **Web application**.
2. **Authorized redirect URI:** `https://<project-ref>.supabase.co/auth/v1/callback`
   (use o `SUPABASE_PROJECT_REF` do §2).
3. Copie o **Client ID** e o **Client Secret**.

> As credenciais são aplicadas no **painel Supabase Auth** na **#0027** (bloco `[auth.external.google]`). Não são
> lidas diretamente pelo Next em produção.

**Coleta:** Client ID e Client Secret (guardados no cofre; aplicados na #0027).

---

## 9. Segredos gerados / decididos

| Var                            | Como obter                                                      |
| ------------------------------ | --------------------------------------------------------------- |
| `CRON_SECRET`                  | `openssl rand -hex 32` — protege as rotas `POST /api/cron/*`    |
| `ADMIN_EMAILS`                 | CSV dos e-mails admin (ex.: `tmaeda@shinrai.app.br`)            |
| `NEXT_PUBLIC_SUPPORT_EMAIL`    | `suporte@vitrinio.com.br`                                       |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | WhatsApp de suporte em **E.164 sem `+`** (ex.: `5567999999999`) |

---

## Template de segredos (checklist consolidado)

Todas as variáveis **obrigatórias em produção** (`requiredInProd` em [`lib/env.ts`](../../lib/env.ts)) mais as
geradas/decididas. Marque conforme coletar; nenhuma deve ficar pendente antes da #0028.

| Variável                                           | Provedor / origem                  | Escopo                        | Coletada |
| -------------------------------------------------- | ---------------------------------- | ----------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`                         | Supabase (§2)                      | público                       | ☐        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                    | Supabase (§2)                      | público                       | ☐        |
| `SUPABASE_SERVICE_ROLE_KEY`                        | Supabase (§2)                      | **servidor**                  | ☐        |
| `SUPABASE_PROJECT_REF`                             | Supabase (§2)                      | servidor                      | ☐        |
| `SUPABASE_DB_PASSWORD`                             | Supabase (§2)                      | **servidor**                  | ☐        |
| `ASAAS_API_URL` (`https://api.asaas.com/v3`)       | Asaas (§3)                         | servidor                      | ☐        |
| `ASAAS_API_KEY`                                    | Asaas (§3)                         | **servidor**                  | ☐        |
| `ASAAS_WEBHOOK_SECRET`                             | Asaas (§3, `openssl rand -hex 32`) | **servidor**                  | ☐        |
| `ASAAS_PLAN_PRO_MONTHLY_ID`                        | Asaas (§3)                         | servidor                      | ☐        |
| `ASAAS_PLAN_PRO_YEARLY_ID`                         | Asaas (§3)                         | servidor                      | ☐        |
| `ASAAS_PLAN_PLUS_MONTHLY_ID`                       | Asaas (§3)                         | servidor                      | ☐        |
| `ASAAS_PLAN_PLUS_YEARLY_ID`                        | Asaas (§3)                         | servidor                      | ☐        |
| `RESEND_API_KEY`                                   | Resend (§4)                        | **servidor**                  | ☐        |
| `EMAIL_FROM`                                       | Resend (§4)                        | servidor                      | ☐        |
| `EMAIL_REPLY_TO`                                   | Resend (§4)                        | servidor                      | ☐        |
| `UPSTASH_REDIS_REST_URL`                           | Upstash (§5)                       | servidor                      | ☐        |
| `UPSTASH_REDIS_REST_TOKEN`                         | Upstash (§5)                       | **servidor**                  | ☐        |
| `NEXT_PUBLIC_SENTRY_DSN`                           | Sentry (§6)                        | público                       | ☐        |
| `SENTRY_AUTH_TOKEN`                                | Sentry (§6)                        | **servidor**                  | ☐        |
| `SENTRY_ORG`                                       | Sentry (§6)                        | servidor                      | ☐        |
| `SENTRY_PROJECT` (`vitrinio`)                      | Sentry (§6)                        | servidor                      | ☐        |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (`vitrinio.com.br`) | Plausible (§7)                     | público                       | ☐        |
| Google OAuth Client ID/Secret                      | Google (§8)                        | **servidor** (Supabase #0027) | ☐        |
| `CRON_SECRET`                                      | gerado (§9)                        | **servidor**                  | ☐        |
| `ADMIN_EMAILS`                                     | decidido (§9)                      | servidor                      | ☐        |
| `NEXT_PUBLIC_SUPPORT_EMAIL`                        | decidido (§9)                      | público                       | ☐        |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP`                     | decidido (§9)                      | público                       | ☐        |

> **NF-e** (`FISCAL_PROVIDER`, `ASAAS_MUNICIPAL_SERVICE_CODE`) fica desligada nesta issue → **#0029**.

---

## Critérios de aceitação (da issue)

- [ ] Todas as variáveis obrigatórias de `lib/env.ts` têm valor de produção reunido (nenhuma pendente).
- [ ] Nenhum segredo de servidor exposto fora do gerenciador; só `NEXT_PUBLIC_*` marcados como públicos.
- [ ] Provedores na região correta (Supabase São Paulo) e no ambiente real (Asaas prod, não sandbox).

## Referências

- [`.env.example`](../../.env.example) — lista canônica de variáveis
- [`lib/env.ts`](../../lib/env.ts) — validação Zod no boot
- `docs/ARCHITECTURE.md` §9 — ambientes
- `docs/CONTRIBUTING.md` §Security — manejo de segredos e `NEXT_PUBLIC_`
- [`issues/0026-provisionar-servicos-producao.md`](../../issues/0026-provisionar-servicos-producao.md)
