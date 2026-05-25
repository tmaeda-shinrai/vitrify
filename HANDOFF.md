# HANDOFF — Issue #0002 (Infraestrutura externa e variáveis de ambiente)

> Documento de continuidade entre sessões/máquinas. Atualize ou remova quando a issue fechar.

**Estado atual:** trabalho de código concluído. Pendente: provisionamento manual nos painéis dos provedores externos.

## O que já está pronto neste branch

- [`lib/env.ts`](lib/env.ts) — schema Zod com split `clientEnv` / `serverEnv`. Em `NODE_ENV=production`, campos críticos viram `required` e o build falha com mensagem clara. Em dev/test segue permissivo (`pnpm dev` sobe sem `.env.local`). `serverEnv` é um `Proxy` que lança erro se for lido em runtime de cliente, garantindo que `SUPABASE_SERVICE_ROLE_KEY` jamais entre num bundle de browser.
- [`.env.example`](.env.example) — sincronizado com o schema. Nome do produto fixado em **Vitrinio**, domínio em **vitrinio.com.br**.
- [`README.md`](README.md) — nova seção `## Variáveis de ambiente` com passo a passo por provedor (Supabase, Vercel, Resend, Asaas, Sentry, Plausible, Upstash, Google OAuth).
- [`app/layout.tsx`](app/layout.tsx) — atualizado para consumir `clientEnv`.

Validações locais que passaram: `pnpm typecheck`, `pnpm lint`, `pnpm test`.

## Pendente nesta issue (trabalho manual nos provedores)

Só humano executa — não dá pra automatizar via CLI:

- [ ] Comprar `vitrinio.com.br` e apontar DNS para Cloudflare; criar subdomínio `staging.vitrinio.com.br`
- [ ] Criar projeto Supabase em **São Paulo**; `supabase login` + `supabase link`; testar `supabase start` (Docker)
- [ ] Habilitar Google OAuth no painel Supabase Auth (precisa Google Cloud Console com callback `https://<project-ref>.supabase.co/auth/v1/callback`)
- [ ] `vercel link` no repo; deploys automáticos (`main` → prod, `staging` → staging, PRs → preview)
- [ ] Configurar domínios na Vercel: `vitrinio.com.br` (main) e `staging.vitrinio.com.br` (staging)
- [ ] Verificar domínio de envio no Resend (SPF + DKIM via Cloudflare)
- [ ] Criar conta sandbox Asaas; gerar `ASAAS_WEBHOOK_SECRET`:
  ```bash
  openssl rand -hex 32
  # Windows:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Criar projeto Sentry (capturar DSN — wiring real é #0024)
- [ ] Adicionar site no Plausible
- [ ] Criar Redis no Upstash
- [ ] Colar **todas** as chaves nos três escopos da Vercel (Production / Preview / Development). `staging` usa o mesmo Supabase de Preview (`docs/ARCHITECTURE.md` §9)
- [ ] Validar deploy "hello world" em `staging.vitrinio.com.br`

## Como retomar em outra máquina

1. `git clone` + checkout do branch atual
2. `pnpm install`
3. `cp .env.example .env.local` e preencher conforme for criando as contas
4. `pnpm dev` deve subir mesmo com `.env.local` incompleto (dev é permissivo)
5. Antes de fechar a issue: rodar `NODE_ENV=production pnpm build` localmente — deve falhar listando exatamente quais vars faltam

## Decisões fechadas nesta sessão

- **Nome do produto:** Vitrinio. **Domínio:** `vitrinio.com.br` (prod) + `staging.vitrinio.com.br` (staging)
- **Estratégia de validação de env:** estrito em `NODE_ENV=production`, permissivo em dev/test (decisão registrada no schema via helper `requiredInProd`)

## Referências

- Issue de origem: [`issues/0002-infraestrutura-e-ambiente.md`](issues/0002-infraestrutura-e-ambiente.md)
- Tabela de ambientes: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) §9
- Plano detalhado da sessão: `~/.claude/plans/vamos-iniciar-o-planejamento-declarative-engelbart.md` (local — copie para a nova máquina se quiser preservar)
