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
