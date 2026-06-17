# [0026] Provisionar serviços de produção

|                |                                               |
| -------------- | --------------------------------------------- |
| **Milestone**  | M7 — Lançamento                               |
| **Roadmap**    | Fase 4 — Lançamento (Semana 13)               |
| **Prioridade** | Must                                          |
| **Planos**     | —                                             |
| **Depende de** | #0002 (infra externa e variáveis de ambiente) |

## Contexto

Para colocar a aplicação em produção em `vitrinio.com.br` precisamos das contas/projetos **de produção** dos
provedores externos e das credenciais correspondentes. Hoje os serviços estão **parcialmente provisionados**: o
Supabase remoto já é usado em desenvolvimento (`.env.local` aponta pra ele), mas Asaas (prod), Resend, Upstash,
Sentry, Plausible e o DNS do domínio precisam ser verificados e/ou criados.

Esta issue **reúne todas as credenciais** que alimentam `.env.example`/`lib/env.ts` — ela não faz deploy nem
mexe no banco (isso é #0027/#0028); entrega o cofre de segredos pronto. O deploy é **produção direto** (sem
staging), então o rigor aqui evita retrabalho depois.

> Segurança: nenhuma chave de service role / API entra em chat, e-mail ou screenshot. Apenas variáveis com
> prefixo `NEXT_PUBLIC_` podem chegar ao cliente (`docs/CONTRIBUTING.md` §Security). Se algo vazar, rotacionar.

## Escopo

Uma frente por provedor; ao final, todas as variáveis reunidas num gerenciador de segredos:

- **DNS `vitrinio.com.br`** — apontar para a Vercel (registros A/CNAME) e adicionar os registros de
  verificação. (A associação domínio↔projeto Vercel é feita na #0028.)
- **Supabase produção** — projeto **dedicado** na região São Paulo (`sa-east-1`), plano **Pro** (backup nativo
  30d + image transformation). Decisão: separado do remoto de dev, sem dados de seed. Coletar:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`.
- **Asaas produção** — conta PJ, ambiente real (`ASAAS_API_URL=https://api.asaas.com/v3`). Criar os **4 planos**
  (Pro/Plus × mensal/anual) e anotar os IDs; gerar o webhook secret (`openssl rand -hex 32`). Coletar:
  `ASAAS_API_KEY`, `ASAAS_WEBHOOK_SECRET`, `ASAAS_PLAN_PRO_MONTHLY_ID`, `ASAAS_PLAN_PRO_YEARLY_ID`,
  `ASAAS_PLAN_PLUS_MONTHLY_ID`, `ASAAS_PLAN_PLUS_YEARLY_ID`.
- **Resend** — verificar o domínio `vitrinio.com.br` (registros DNS de envio). Coletar: `RESEND_API_KEY`,
  `EMAIL_FROM` (`Vitrinio <ola@vitrinio.com.br>`), `EMAIL_REPLY_TO` (`suporte@vitrinio.com.br`).
- **Upstash Redis** — criar database REST em região próxima. Coletar: `UPSTASH_REDIS_REST_URL`,
  `UPSTASH_REDIS_REST_TOKEN`.
- **Sentry** — projeto `vitrinio`; gerar auth token para upload de source maps no build. Coletar:
  `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT=vitrinio`.
- **Plausible** — cadastrar o site `vitrinio.com.br`. Coletar: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=vitrinio.com.br`.
- **Google OAuth** — credenciais OAuth 2.0 no Google Cloud Console; redirect URI
  `https://<project-ref>.supabase.co/auth/v1/callback` (aplicado no painel Supabase na #0027).
- **Segredos gerados/decididos** — `CRON_SECRET` (`openssl rand -hex 32`), `ADMIN_EMAILS` (CSV),
  `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_SUPPORT_WHATSAPP` (E.164 sem `+`).

### Fora de escopo

- Aplicar migrations, configurar Auth/SMTP no painel e agendar crons → #0027.
- Lançar env vars na Vercel, domínio, webhook e backup → #0028.
- Ativar NF-e (`FISCAL_PROVIDER`/`ASAAS_MUNICIPAL_SERVICE_CODE`) → #0029.
- Criação da empresa/CNPJ e caixas `dpo@`/`direitos@` → #0030.

## Tarefas

- [ ] DNS de `vitrinio.com.br` apontando para a Vercel + registros de verificação
- [ ] Projeto Supabase de **produção** (São Paulo, Pro) criado; 5 variáveis coletadas
- [ ] Conta Asaas de produção; 4 planos criados (IDs anotados) + webhook secret gerado
- [ ] Domínio verificado no Resend; `RESEND_API_KEY`/`EMAIL_FROM`/`EMAIL_REPLY_TO` coletados
- [ ] Upstash Redis criado; URL + token coletados
- [ ] Projeto Sentry `vitrinio`; DSN + auth token + org coletados
- [ ] Site no Plausible; domínio coletado
- [ ] Credenciais Google OAuth criadas (client id/secret) com a redirect URI correta
- [ ] `CRON_SECRET` gerado; `ADMIN_EMAILS` e variáveis de suporte definidas
- [ ] Todas as credenciais num gerenciador de segredos; `.env.example` ainda sincronizado

## Critérios de aceitação

- [ ] Todas as variáveis obrigatórias de `lib/env.ts` têm valor de produção reunido (nenhuma pendente)
- [ ] Nenhum segredo de servidor exposto fora do gerenciador; só `NEXT_PUBLIC_*` marcados como públicos
- [ ] Provedores na região correta (Supabase São Paulo) e no ambiente real (Asaas prod, não sandbox)

## Referências

- `.env.example` (lista canônica de variáveis), `lib/env.ts` (validação Zod no boot)
- `docs/README.md` (pré-requisitos), `docs/ARCHITECTURE.md` §9 (ambientes)
- `issues/0002-infraestrutura-e-ambiente.md` (setup original dos provedores)
- `docs/CONTRIBUTING.md` §Security (manejo de segredos, `NEXT_PUBLIC_`)
