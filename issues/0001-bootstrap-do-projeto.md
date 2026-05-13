# [0001] Bootstrap do projeto e ferramental

|                |                           |
| -------------- | ------------------------- |
| **Milestone**  | M0 — Fundação             |
| **Roadmap**    | Fase 0 — Setup (Semana 0) |
| **Prioridade** | Must                      |
| **Planos**     | —                         |
| **Depende de** | —                         |
| **Bloqueia**   | praticamente todas        |

## Contexto

Preparar a base do projeto para começar a desenvolver sem fricção. Hoje o repositório só contém `docs/` e `.env.example`; não existe `package.json`, app, build nem repositório git inicializado. Esta issue cria o esqueleto descrito em `docs/ARCHITECTURE.md` §3–4 com as ferramentas e convenções de `docs/CONTRIBUTING.md`.

## Escopo

- Inicializar repositório git e repositório no GitHub, com branch protection no `main` (merge só via PR, sem auto-merge) e branch `staging`.
- Criar projeto **Next.js 14 (App Router)** com **TypeScript strict** (`strict: true` no `tsconfig.json`, sem afrouxar).
- Configurar **Tailwind CSS 3** com os tokens semânticos de `docs/DESIGN.md` em `tailwind.config.ts` (cores `brand-primary`, `brand-secondary`, `brand-accent`, `whatsapp`, neutras, `success/warning/danger`; raios `radius-sm/md/lg/xl`; sombras; tipografia Inter + Plus Jakarta Sans via `next/font`).
- Instalar e inicializar **shadcn/ui** (Radix), **Lucide React**, `clsx` + `tailwind-merge` (helper `cn()`), `class-variance-authority`.
- Instalar **React Hook Form + Zod**, **TanStack Query 5**.
- Configurar **ESLint + Prettier**, **Husky + lint-staged** (pre-commit roda lint + typecheck nos arquivos staged).
- Configurar **pnpm** como gerenciador de pacotes (Node 20+); adicionar `.nvmrc`/engines.
- Criar a estrutura de pastas de `docs/ARCHITECTURE.md` §4 (`app/(auth|dashboard|public)`, `app/api`, `components/{ui,product,vitrine,shared}`, `lib/{supabase,asaas→payments,validators,utils,analytics}`, `hooks`, `types`, `messages/pt-BR.json`, `public/{icons,manifest.json}`, `styles/globals.css`, `tests/{e2e,unit}`, `supabase/{migrations,functions,seed.sql}`).
- Configurar **CI no GitHub Actions**: typecheck + lint (testes entram em issues posteriores).
- Configurar **Vitest** (unit/integração) e **Playwright** (E2E) com scripts em `package.json`.
- Configurar i18n com `next-intl` (ou similar) com todas as strings em `messages/pt-BR.json` desde o início (`docs/DESIGN.md` §7).
- `.gitignore` cobrindo `.env.local`, `node_modules`, `.next`, etc.
- Atualizar `README.md` com instruções de setup reais; mover/garantir `docs/` versionado.

### Fora de escopo (vai em outra issue)

- Criação das contas e serviços externos (Supabase, Vercel, Asaas, Resend) e suas variáveis → #0002
- Schema do banco → #0003
- Qualquer feature de produto

## Tarefas

- [ ] `git init` + repo no GitHub + branch protection no `main` + branch `staging`
- [ ] `pnpm create next-app` (App Router, TS, Tailwind, ESLint) + ajustes
- [ ] `tsconfig.json` em modo strict, paths (`@/*`)
- [ ] Tailwind config com tokens de `DESIGN.md`; `globals.css` com tokens CSS e estilos globais
- [ ] Fontes via `next/font` (Inter, Plus Jakarta Sans)
- [ ] `npx shadcn-ui init` + componentes base mínimos (Button, Input, Textarea, Select, Dialog, Sheet, Toast, Skeleton, Tabs, Badge, Card, Avatar, Checkbox, Switch)
- [ ] Helper `cn()`; padrão `cva` documentado
- [ ] Instalar RHF + Zod, TanStack Query (provider no root layout)
- [ ] ESLint + Prettier + Husky + lint-staged (pre-commit)
- [ ] Estrutura de pastas conforme `ARCHITECTURE.md` §4
- [ ] `next-intl` + `messages/pt-BR.json` inicial
- [ ] GitHub Actions: workflow `ci.yml` com `typecheck` e `lint`
- [ ] Vitest configurado (`pnpm test`, `pnpm test -- <arquivo>`)
- [ ] Playwright configurado (`pnpm test:e2e`)
- [ ] `README.md` atualizado com setup; `.gitignore`

## Critérios de aceitação

- [ ] `pnpm install && pnpm dev` sobe a aplicação em `localhost:3000` com uma landing "hello world" estilizada com os tokens da marca
- [ ] `pnpm typecheck` e `pnpm lint` passam sem erro
- [ ] `pnpm test` e `pnpm test:e2e` rodam (mesmo que com um teste de fumaça)
- [ ] CI do GitHub Actions roda e fica verde em um PR de exemplo
- [ ] Pre-commit bloqueia commit com erro de lint/typecheck
- [ ] `main` exige PR para merge

## Referências

- `docs/ARCHITECTURE.md` §3 (stack), §4 (estrutura de pastas)
- `docs/CONTRIBUTING.md` §1 (fluxo), §2 (convenções de código), §3 (testes), §7 (env), §9 (dependências)
- `docs/DESIGN.md` §2 (identidade visual / tokens), §3 (componentes), §7 (i18n)
- `docs/ROADMAP.md` Fase 0 — Setup
- `docs/README.md` (pré-requisitos)
