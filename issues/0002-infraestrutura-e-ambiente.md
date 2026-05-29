# [0002] Infraestrutura externa e variáveis de ambiente

|                |                            |
| -------------- | -------------------------- |
| **Milestone**  | M0 — Fundação              |
| **Roadmap**    | Fase 0 — Setup (Semana 0)  |
| **Prioridade** | Must                       |
| **Planos**     | —                          |
| **Depende de** | #0001                      |
| **Bloqueia**   | #0003, #0004, #0005, #0018 |

## Contexto

Criar e conectar os serviços gerenciados que sustentam a aplicação e padronizar a configuração por ambiente. A lista de variáveis já está em `.env.example`; esta issue cria as contas, conecta tudo e tipa as variáveis no código.

## Escopo

- **Supabase**: criar projeto na região **South America (São Paulo)** (importante para latência e LGPD — ver `docs/LEGAL.md` §1.8). Anotar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`. Configurar `supabase` CLI e `supabase start` (Docker local).
- **Vercel**: conectar o repositório, deploy automático (`main` → produção, PRs → preview, `staging` → staging). Configurar Environment Variables (Production / Preview / Development) com os valores acima.
- **Domínio + DNS**: o domínio do produto é **`vitrinio.com.br`** (já adquirido). Apontar DNS (Cloudflare) e configurar subdomínio `staging.vitrinio.com.br`.
- **Resend**: criar conta, domínio de envio verificado, `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`.
- **Asaas**: criar conta e pegar credenciais de **sandbox** (`ASAAS_API_URL=https://sandbox.asaas.com/api/v3`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_SECRET` gerado com `openssl rand -hex 32`). Os IDs de plano (`ASAAS_PLAN_*`) ficam vazios por ora (criados no painel após deploy, em #0018).
- **Sentry**: criar projeto, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (wiring completo + alertas ficam em #0024).
- **Plausible**: configurar domínio (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) — analytics sem cookies, dispensa banner (`docs/LEGAL.md` §5).
- **Upstash Redis**: criar instância, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (usado para rate limiting em #0010/#0015).
- **Validação de env no boot**: criar `lib/env.ts` com schema Zod que falha o build se faltar variável obrigatória; separar variáveis públicas (`NEXT_PUBLIC_*`) das privadas; nunca expor service role ao cliente.
- Manter `.env.example` sincronizado; documentar no `README.md` como obter cada chave.
- Configurar **Google OAuth** no painel Supabase Auth (client id/secret) — usado em #0006.

### Fora de escopo (vai em outra issue)

- Schema, triggers, RLS → #0003, #0004
- Criação dos planos no Asaas e webhook → #0018
- Wiring completo do Sentry e alertas → #0024

## Tarefas

- [x] Projeto Supabase em São Paulo; `supabase` CLI logado (`supabase start` local depende de Docker — ver adiamento abaixo)
- [x] Vercel conectado ao repo; envs em Production/Preview; deploy automático ok (escopo Development pulado — dev local usa `.env.local`)
- [x] Domínio adquirido + DNS apontando; `staging.` configurado (alias de Production até upgrade — ver adiamento abaixo)
- [x] Resend: domínio verificado, chaves no env
- [x] Asaas sandbox: chaves no env; `ASAAS_WEBHOOK_SECRET` gerado
- [x] Sentry: projeto criado, DSN no env
- [x] Plausible: domínio configurado
- [x] Upstash Redis: instância + chaves no env
- [x] `lib/env.ts` com validação Zod (build falha se faltar var); tipos exportados
- [x] Google OAuth configurado no Supabase Auth (provider habilitado)
- [x] `.env.example` atualizado; `README.md` com passo a passo de obtenção das chaves

## Critérios de aceitação

- [x] Deploy de "hello world" passa para o domínio em produção (`vitrinio.com.br`) — `staging.vitrinio.com.br` ainda aliasing prod até Custom Environment ser criado
- [x] `pnpm build` falha com mensagem clara se uma variável obrigatória estiver ausente
- [ ] `supabase start` sobe Postgres/Auth/Storage localmente — **adiado**: Docker não instalado nesta máquina; será validado quando começarmos a issue #0003 (schema)
- [x] Service role key não aparece em nenhum bundle do cliente (garantido pelo Proxy em `lib/env.ts` que lança no runtime do cliente)
- [x] Nenhum segredo real comitado (`.env.local` ignorado)

## Status

**Fechada em 2026-05-29.** PRs envolvidos: [#2](https://github.com/tmaeda-shinrai/vitrify/pull/2) (código), [#4](https://github.com/tmaeda-shinrai/vitrify/pull/4) (gitignore supabase/.temp/), [#5](https://github.com/tmaeda-shinrai/vitrify/pull/5) (remove HANDOFF.md).

### Itens adiados (não bloqueiam dependentes)

- **`supabase start` local** — exige Docker, que não está instalado. Será validado ao começar a #0003.
- **Custom Environment `staging` na Vercel** — feature paga (Vercel Pro). Por ora, `staging.vitrinio.com.br` está vinculado ao environment Production e serve o mesmo conteúdo que `vitrinio.com.br`. Quando justificar o upgrade, criamos o environment dedicado.
- **`SENTRY_AUTH_TOKEN`** — preenchido na #0024 (wiring real do SDK + source maps).
- **`ASAAS_PLAN_*_ID`** — pós-deploy do app, na #0018 (criação dos planos no painel Asaas).

## Referências

- `.env.example` (lista completa de variáveis)
- `docs/ARCHITECTURE.md` §1–3 (stack), §9 (deploy e ambientes), §11 (custos)
- `docs/CONTRIBUTING.md` §4 (segurança), §7 (variáveis de ambiente)
- `docs/LEGAL.md` §1.8 (hosting/transferência internacional), §5 (cookies)
- `docs/PRICING.md` §3 (escolha do gateway)
- `docs/ROADMAP.md` Fase 0 — Setup
