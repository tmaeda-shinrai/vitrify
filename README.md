# Vitrinio

Vitrine digital para revendedoras de venda direta (Avon, Natura, Hinode, Mary Kay e outras).
Monte uma loja online em um link, compartilhe nas redes e venda direto pelo WhatsApp.

> Documentação completa do produto, arquitetura, design e roadmap em [`docs/`](./docs/README.md).
> Backlog do MVP em [`issues/`](./issues/README.md).

## Pré-requisitos

- Node.js 20+ (ver [`.nvmrc`](./.nvmrc))
- [pnpm](https://pnpm.io/) 9+
- Git

## Setup local

```bash
# 1. Clone e entre no projeto
git clone https://github.com/tmaeda-shinrai/vitrify.git
cd vitrify

# 2. Instale dependências
pnpm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores (Supabase, Asaas, Resend, etc.)

# 4. Suba o dev server
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Lista completa em [`.env.example`](./.env.example). Tipagem e validação em [`lib/env.ts`](./lib/env.ts) (Zod) — em `NODE_ENV=production`, o build falha se faltar qualquer variável obrigatória. Em desenvolvimento o schema é permissivo, então você consegue rodar `pnpm dev` antes de ter todas as integrações configuradas.

Onde pegar cada chave:

- **Supabase** — criar projeto na região **South America (São Paulo)**. Em `Settings → API` copie `Project URL` (→ `NEXT_PUBLIC_SUPABASE_URL`), `anon public` (→ `NEXT_PUBLIC_SUPABASE_ANON_KEY`) e `service_role` (→ `SUPABASE_SERVICE_ROLE_KEY`, server-only, **nunca** comitar). `SUPABASE_PROJECT_REF` é o ID do projeto; `SUPABASE_DB_PASSWORD` está em `Settings → Database`.
- **Vercel** — rode `vercel link` no repo. Configure as variáveis em `Project Settings → Environment Variables`, separadas por escopo: **Production** (branch `main`), **Preview** (PRs) e **Development** (`vercel env pull`).
- **Resend** — verifique o domínio `vitrinio.com.br` (registros SPF + DKIM via Cloudflare). Em `API Keys` gere `RESEND_API_KEY`.
- **Asaas** — crie conta sandbox em [sandbox.asaas.com](https://sandbox.asaas.com). Em `Integrações → API` copie `ASAAS_API_KEY`. Gere `ASAAS_WEBHOOK_SECRET` localmente:
  ```bash
  openssl rand -hex 32
  # Windows sem openssl:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Os `ASAAS_PLAN_*_ID` ficam vazios até a issue #0018 (criação dos planos no painel pós-deploy).
- **Sentry** — crie projeto Next.js. `Settings → Client Keys` dá o DSN (→ `NEXT_PUBLIC_SENTRY_DSN`). Wiring real do SDK e alertas é #0024.
- **Plausible** — adicione `vitrinio.com.br` no painel. Use o mesmo nome do site em `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Analytics sem cookies (dispensa banner — ver `docs/LEGAL.md` §5).
- **Upstash Redis** — crie um database global. Na aba `REST API`, copie `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.
- **Google OAuth** — no Google Cloud Console, crie um `OAuth 2.0 Client ID` (tipo Web), callback `https://<project-ref>.supabase.co/auth/v1/callback`. Cole client id/secret em **Supabase Auth → Providers → Google**. Não vai no `.env`.

Tabela de ambientes (Production / Preview / Staging / Local) em [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) §9.

## Scripts

| Comando             | O que faz                                         |
| ------------------- | ------------------------------------------------- |
| `pnpm dev`          | Sobe o Next.js em modo desenvolvimento            |
| `pnpm build`        | Build de produção                                 |
| `pnpm start`        | Servir o build de produção                        |
| `pnpm lint`         | ESLint                                            |
| `pnpm typecheck`    | TypeScript em modo `--noEmit`                     |
| `pnpm test`         | Vitest (unit + integração), execução única        |
| `pnpm test:watch`   | Vitest em watch mode                              |
| `pnpm test:e2e`     | Playwright (E2E, sobe `pnpm dev` automaticamente) |
| `pnpm format`       | Prettier formata o repositório                    |
| `pnpm format:check` | Verifica formatação sem alterar                   |

## Stack

- **Next.js 14** (App Router) + **TypeScript** strict
- **Tailwind CSS 3** + **shadcn/ui** (Radix) + Lucide
- **React Hook Form** + **Zod** + **TanStack Query 5**
- **next-intl** (pt-BR)
- **Supabase** (Postgres 15 + Auth + Storage)
- **Asaas** (gateway de pagamento, BR)
- **Vitest** + **Playwright**
- **Husky** + **lint-staged** (pre-commit roda lint + typecheck)

Detalhes em [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Branches & PR

- `main` → produção (protegida; merge só via PR)
- `staging` → ambiente de homologação
- `feat/...`, `fix/...`, `chore/...`, `docs/...` para trabalho

Convenções em [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md). Commits em [Conventional Commits](https://www.conventionalcommits.org/) em português:
`feat(produto): permite cadastrar até 5 imagens`.

## Status

MVP em construção. Trabalho organizado em ~25 issues numeradas em [`issues/`](./issues/README.md).
