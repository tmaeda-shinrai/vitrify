# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

**The MVP scaffold exists and the first milestones are implemented.** The Next.js 14 App Router app is set up (TypeScript strict, Tailwind, shadcn/ui, next-intl pt-BR, TanStack Query, Vitest + Playwright) with `supabase/` migrations + seed for the local stack. The commands and structure below are real — verify against the tree, but don't assume the repo is empty.

**Done so far (merged to `main`):**

- **M0 — Fundação:** #0001 bootstrap/tooling, #0002 infra & env (`lib/env.ts` with Zod boot validation), #0003 schema + triggers (`handle_new_user`, `set_updated_at`, `check_product_limit`) + dev seed, #0004 RLS on every user table.
- **M1 — Conta e autenticação:** #0005 auth e-mail/senha (Server Actions, `@supabase/ssr` clients in `lib/supabase/`, session middleware, Upstash login rate-limit, Resend pt-BR templates), #0006 Google OAuth (`/auth/callback`, automatic e-mail linking), #0007 dashboard shell (`app/(dashboard)/` auth guard + `MobileBottomNav`/`DesktopSidebar` + placeholder routes + `useCurrentUser`), #0008 onboarding wizard (`/onboarding`, slug availability via `is_slug_available` RPC, activates the vitrine), #0009 perfil/conta/exclusão LGPD (edição de perfil+vitrine, `ImageUploader` reutilizável + `avatars` bucket, `request_account_deletion`/`anonymize_account`).
- **M2 — Produtos e vitrine:** #0010 CRUD de produtos parte 1 — listagem (`/produtos` com `ProductsManager`), `ProductForm` em `Sheet` (RHF+Zod), upload da foto principal (`products` bucket, reusa `ImageUploader`), `createProductAction` (rate-limit 30/min, checagem de limite Free + trigger `check_product_limit`), modal de upgrade, auto-save de rascunho (localStorage), preços em centavos (`lib/money.ts`). #0011 CRUD parte 2 (4 PRs) — edição/exclusão, "esgotado" (`is_available`) e preço promocional; categorias (sheet de gestão) e marca por autocomplete (`<datalist>` de `suggested_brands` + livres, find-or-create); até 5 imagens (`ProductImagesManager`, capa/ordem/remover, reconciliação de `product_images`); reordenação por drag-and-drop (`@dnd-kit`, `display_order`) + duplicar produto (copia campos e imagens no Storage). #0012 vitrine pública (`app/(public)/[slug]`, Server Component + ISR `revalidate=60`/`generateStaticParams`) em 2 PRs: leitura em `lib/vitrine-data.ts` via clients **sem cookies** (`lib/supabase/public` anon + `admin` service role para o perfil, pois `profiles` não tem RLS pública); `VitrineHeader`/`VitrineGrid` (reusa `ProductCard`)/`ProductDetailModal` com carrossel scroll-snap; tema claro/escuro/auto (`.theme-auto`) + `theme_primary` e `prefers-reduced-motion`; SEO/OG/Schema.org (`generateMetadata` + JSON-LD), `sitemap.xml`/`robots.txt`; o CTA "Pedir no WhatsApp" é um link `wa.me` básico (a lógica completa — mensagem + intent — é #0013). `setRequestLocale` no root layout habilita o render estático/ISR. #0013 botão "Pedir no WhatsApp": `WhatsAppButton` (verde + `WhatsappIcon` SVG inline) no card (slot `action` do `ProductCard`) e no modal, com mensagem pré-formatada por produto (`lib/whatsapp.ts`: nome + preço/promo + link); botão flutuante geral (`VitrineWhatsappFab`, mensagem genérica); desabilita em "esgotado"; e ping **não-bloqueante** `recordOrderIntent` (`lib/intent.ts`, `navigator.sendBeacon`) a `POST /api/intent` no mesmo clique — o endpoint/persistência/rate-limit/hash de IP e o painel de Pedidos são da #0015 (até lá a chamada dá 404 silencioso). #0014 navegabilidade da vitrine: busca + filtros por categoria/marca **client-side** sobre os produtos já carregados (`lib/search.ts`, `VitrineExplorer`; preserva o ISR — estado lido/escrito na URL via `window.location`/`history.replaceState`; full-text GIN do Postgres = otimização futura), empty states (`EmptyState`: vitrine vazia / sem resultado com "limpar filtros"), placeholder "Foto em breve" no `ProductCard`, e `ShareButton` reutilizável (Web Share API + fallback copiar link) no painel (`/produtos`) e na vitrine.
- **M3 — Pedidos e estatísticas (em andamento):** #0015 (core) intenções de pedido — `POST /api/intent` (anon, sem cookies; rate-limit 10/min por IP + dedup curto por `ip_hash`+`product_id` via Upstash; **SHA-256 do IP** (`hashIp`, nunca o IP cru); user-agent resumido a 3 categorias; `source` derivado do referrer — `lib/intent-source.ts`, `lib/validators/intent.ts`) insere em `order_intents`; o trigger `bump_product_intents` soma `products.intents_count`. Tela **Pedidos** (`app/(dashboard)/pedidos`) com feed agrupado por dia (`lib/intents.ts` + `IntentsFeed`), produto/horário/dispositivo e origem (Pro+); `recordOrderIntent` (#0013) agora envia `referrer`. Contagem de **views** da vitrine (PR2): ping no client (`VitrineViewTracker`/`recordVitrineView`, `lib/view.ts`, dedup por sessão) → `POST /api/view` → RPC `increment_vitrine_views` (dedup curto por IP). #0015 completo.

**Routing reality to know:** the `(dashboard)` group is parenthesized (no URL segment), so the panel home is **`/produtos`** — there is no `/dashboard` route. Post-auth redirects go through `DEFAULT_REDIRECT` in `lib/auth/redirect.ts` (= `/produtos`). The auth guard lives in `app/(dashboard)/layout.tsx` (no session → `/login`; `onboarding_completed_at` null → `/onboarding`).

**Not built yet:** #0016 onward (estatísticas, PWA, Asaas billing, etc.). `lib/asaas/` is still a stub.

The canonical decisions are in `docs/ARCHITECTURE.md` (§3 stack, §4 folder structure) and `docs/ROADMAP.md` (build order). Work is broken into ~25 numbered issues under `issues/` (see `issues/README.md` for the index + SPEC→issue map) — pick one up there and respect its **Depende de** field. Treat `docs/` as the source of truth and keep both `docs/` and the relevant `issues/*.md` updated in the same change that alters behavior or schema.

> Note: `.env.local` currently points at the **remote** Supabase project, so end-to-end checks of authenticated flows are usually done manually; automated tests cover validators, components, and unauthenticated redirects, with the local Supabase stack (`supabase start`) used for DB-level checks.

## What this product is

A PWA where Brazilian multi-brand direct-sales resellers (Avon + Natura + Hinode + Mary Kay, etc.) build one shareable digital storefront ("vitrine") at `app-domain/their-slug`. The public storefront lists products (photo, name, price); each product has a **"Pedir no WhatsApp"** button that records an order-intent and opens WhatsApp with a pre-filled message. The sale itself is closed in WhatsApp — the app never handles a cart or checkout for end-customers. Monetization is a recurring SaaS subscription (Free / Pro / Plus) billed via Asaas (PIX/card/boleto). All UI copy is **pt-BR**.

> Naming note: the product is **Vitrinio** (domain `vitrinio.com.br`, already acquired). The repo folder is still named `vitrify` for historical reasons — don't rename it. In code/configs use `vitrinio` (e.g. `package.json` name, `NEXT_PUBLIC_APP_NAME=Vitrinio`, `SENTRY_PROJECT=vitrinio`).

## Documentation map

| File                   | Read when you need…                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/README.md`       | One-paragraph overview, stack summary, prerequisites                                                                                        |
| `docs/SPEC.md`         | Problem, solution, product principles, personas, MVP scope, success metrics                                                                 |
| `docs/FEATURES.md`     | Feature list with MoSCoW priority and Free/Pro/Plus split                                                                                   |
| `docs/DESIGN.md`       | Design tokens (colors, type, spacing, radii), component list, UX patterns, key user flows                                                   |
| `docs/ARCHITECTURE.md` | Stack, system diagram, ADR-worthy decisions, folder structure, critical flows, security, perf budgets                                       |
| `docs/DATABASE.md`     | Postgres schema (all tables/columns), triggers, RLS policies, migration strategy, seed plan                                                 |
| `docs/ROADMAP.md`      | Phased MVP plan with per-week deliverables and done-criteria                                                                                |
| `docs/CONTRIBUTING.md` | Branch/commit/PR conventions, code style, testing strategy, security checklist                                                              |
| `docs/PRICING.md`      | Plan pricing, why Asaas over Stripe, conversion strategy                                                                                    |
| `docs/LEGAL.md`        | LGPD obligations, IP/brand-image risk, terms, account deletion                                                                              |
| `docs/GTM.md`          | Acquisition channels and launch plan                                                                                                        |
| `issues/README.md`     | Backlog index: ~25 issues (`issues/NNNN-slug.md`) grouped into milestones M0–M7, with dependencies and a map from `SPEC.md` §6/§8 to issues |

## Planned architecture (the big picture)

Fullstack monolith on **Next.js 14 App Router** (TypeScript) deployed to **Vercel**, with **Supabase** (Postgres 15 + Auth + Storage + Edge Functions) as the backend, and **Asaas** as the payment gateway (webhook-driven). Email via Resend; rate limiting via Upstash Redis; errors via Sentry; analytics via Plausible.

Three route groups under `app/`:

- `(auth)/` — login, cadastro, recuperar-senha (Supabase Auth, Google OAuth)
- `(dashboard)/` — the reseller's panel: produtos, pedidos, estatisticas, conta (mobile-first, bottom nav)
- `(public)/[slug]/` — the public storefront, rendered as a **Server Component with ISR (`revalidate` 60s)**; product edits call `revalidatePath('/<slug>')`

API surface under `app/api/`: `webhooks/asaas` (HMAC-validated, idempotent by event id), `intent` (public, rate-limited, non-blocking write of order-intents). Shared code in `lib/` (`supabase/` server+browser clients, `asaas/` client, `validators/` Zod schemas shared client↔server, `analytics/`), `components/ui/` (shadcn) + `components/{product,vitrine,shared}/`, `supabase/migrations/` for versioned SQL.

### Flows that span multiple files (know these before editing)

- **Product create**: client compresses image (browser-image-compression → ~webp, ≤1200px, ≤500KB) → direct upload to Supabase Storage via signed URL → `POST /api/products` with the URL → server validates with Zod, enforces plan limit, inserts → TanStack Query cache update.
- **Order intent**: product button → non-blocking `POST /api/intent` (slug, product id, source/referrer, short UA, **SHA-256 hash of IP** — never the raw IP) → in parallel redirect to `wa.me/<phone>?text=<message>`. Owner sees intents in the "Pedidos" panel.
- **Recurring payment**: "Assinar Pro" → `/api/checkout` creates Asaas customer+subscription, returns payment link → user pays (PIX QR / card / boleto) → Asaas webhook → `/api/webhooks/asaas` validates HMAC, upserts `subscriptions` + `invoices` → next request reflects new plan/limits.

### Data model essentials

`profiles` (1:1 with `auth.users`, auto-created by `handle_new_user` trigger which also seeds a `free` `subscriptions` row and an inactive `vitrines` row) → `vitrines` (slug-keyed, `is_active` gate for public visibility) → `products` (+ `product_images`, `categories`, `brands` — all per-vitrine) and `order_intents`; plus `subscriptions` → `invoices`, and `audit_logs` / `referrals`. **Prices are stored as integer cents** (`price_cents`, `promo_price_cents`); formatting to `R$ 32,90` happens only in the presentation layer. Postgres full-text search on products via a generated `search_text` tsvector (Portuguese config). Plan-limit enforcement is both a DB trigger (`check_product_limit`) and an app-layer check.

## Engineering conventions (from `docs/CONTRIBUTING.md`)

- **Package manager: pnpm.** Node 20+.
- **Commits: Conventional Commits, description in Portuguese** — `feat(produto): permite cadastrar até 5 imagens`. Types: `feat fix chore docs refactor test style perf`.
- **Branches**: `main` (→ prod), `staging` (→ staging), `feat/…`, `fix/…`, `chore/…`, `docs/…`. Everything via PR; keep PRs under ~500 changed lines.
- **TypeScript strict, no `any`** (use `unknown` + validate). Shared types in `types/`; shared Zod schemas in `lib/validators/`.
- **Server Components by default**; add `"use client"` only for state/effects/browser-event/browser-API/client-only-lib needs.
- **Named exports only** for components (Next pages are the exception). One component per file. File names kebab-case (`product-card.tsx`), components PascalCase, hooks `useXxx`, SQL tables/columns snake_case.
- **Tailwind only** (no loose CSS outside `globals.css`); semantic tokens (`brand-primary`, not `purple-600`) in `tailwind.config.ts`; `cn()` for conditional classes; `cva` for variants. Design tokens are enumerated in `docs/DESIGN.md`.
- **Forms**: React Hook Form + Zod resolver; disable submit while `isSubmitting`; toast on success.
- **DB access**: typed Supabase client (`supabase gen types`); server client in `lib/supabase/server.ts` for server code; browser client wrapped in TanStack Query hooks for client code; state-changing mutations go through Server Actions / Route Handlers, not the browser client directly. Always select explicit columns (never `SELECT *`), always `LIMIT` lists.
- **Security**: RLS on every table with user data (service role only in webhook/admin routes, never shipped to client); validate every input server-side with Zod; sanitize user HTML/Markdown before render; block SVG uploads; validate slug against a reserved-word blacklist; never log email/phone/CPF/payment data; webhook HMAC + idempotency always.
- **`.env`**: keep `.env.example` in sync; validate env at boot with Zod in `lib/env.ts` (build fails if missing); `NEXT_PUBLIC_` prefix only for values that may reach the browser.
- **Migrations** in `supabase/migrations/` named `YYYYMMDDHHMMSS_descricao.sql`, append-only (never edit an applied one), idempotent where possible, destructive changes done in two steps across separate PRs.

## Commands

```bash
pnpm install
pnpm dev                       # Next.js dev server on :3000
pnpm build && pnpm start       # production build + serve
pnpm lint                      # ESLint
pnpm typecheck                 # tsc --noEmit  (verify exact script name in package.json)
pnpm test                      # Vitest (unit/integration) — *.test.ts / *.spec.ts beside the code
pnpm test -- <path>            # run a single test file
pnpm test:e2e                  # Playwright (critical flows only — see CONTRIBUTING §3.2)

supabase start                 # local Postgres/Auth/Storage via Docker
supabase db push               # apply migrations
supabase gen types typescript --local > types/supabase.ts   # regenerate DB types after schema changes
```

CI (GitHub Actions, `.github/workflows/ci.yml`) runs typecheck + lint + unit tests + E2E-on-preview; production deploy is a manual promotion during the MVP. These scripts exist in `package.json` today; the Vitest suite enables JSX via `@vitejs/plugin-react` (see `vitest.config.ts`). Note: the Playwright browser may need `pnpm exec playwright install chromium` in a fresh environment.
