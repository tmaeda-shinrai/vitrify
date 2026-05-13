# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

**This is a planning-stage repository — there is no application code yet.** The only contents are `docs/` (full product/engineering specs), `issues/` (MVP backlog derived from the docs), and `.env.example`. There is no `package.json`, no `app/`, no build, and no git repo initialized. The commands and structure below describe what *will* exist once the MVP is scaffolded per the docs; don't assume any of it is present until you see it.

When asked to start building, the canonical scaffold and decisions are in `docs/ARCHITECTURE.md` (§3 stack, §4 folder structure) and `docs/ROADMAP.md` (Fase 0 = setup checklist, Fase 1+ = build order). The work is already broken into ~25 numbered issues under `issues/` (see `issues/README.md` for the index, milestones, and a SPEC→issue traceability map) — start there to pick up a unit of work; respect each issue's **Depende de** field. Treat `docs/` as the source of truth and keep both `docs/` and the relevant `issues/*.md` updated in the same change that alters behavior or schema.

## What this product is

A PWA where Brazilian multi-brand direct-sales resellers (Avon + Natura + Hinode + Mary Kay, etc.) build one shareable digital storefront ("vitrine") at `app-domain/their-slug`. The public storefront lists products (photo, name, price); each product has a **"Pedir no WhatsApp"** button that records an order-intent and opens WhatsApp with a pre-filled message. The sale itself is closed in WhatsApp — the app never handles a cart or checkout for end-customers. Monetization is a recurring SaaS subscription (Free / Pro / Plus) billed via Asaas (PIX/card/boleto). All UI copy is **pt-BR**.

> Naming note: the repo folder is `vitrify`; the docs call the product **"Vitri"** (`vitri.app`) in most places but `README.md` also references `vitrinio.com.br`. The name isn't finalized — confirm before hard-coding it anywhere.

## Documentation map

| File | Read when you need… |
|---|---|
| `docs/README.md` | One-paragraph overview, stack summary, prerequisites |
| `docs/SPEC.md` | Problem, solution, product principles, personas, MVP scope, success metrics |
| `docs/FEATURES.md` | Feature list with MoSCoW priority and Free/Pro/Plus split |
| `docs/DESIGN.md` | Design tokens (colors, type, spacing, radii), component list, UX patterns, key user flows |
| `docs/ARCHITECTURE.md` | Stack, system diagram, ADR-worthy decisions, folder structure, critical flows, security, perf budgets |
| `docs/DATABASE.md` | Postgres schema (all tables/columns), triggers, RLS policies, migration strategy, seed plan |
| `docs/ROADMAP.md` | Phased MVP plan with per-week deliverables and done-criteria |
| `docs/CONTRIBUTING.md` | Branch/commit/PR conventions, code style, testing strategy, security checklist |
| `docs/PRICING.md` | Plan pricing, why Asaas over Stripe, conversion strategy |
| `docs/LEGAL.md` | LGPD obligations, IP/brand-image risk, terms, account deletion |
| `docs/GTM.md` | Acquisition channels and launch plan |
| `issues/README.md` | Backlog index: ~25 issues (`issues/NNNN-slug.md`) grouped into milestones M0–M7, with dependencies and a map from `SPEC.md` §6/§8 to issues |

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

## Commands (once the project is scaffolded — none of these work yet)

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

CI (GitHub Actions) is expected to run typecheck + lint + unit tests + E2E-on-preview; production deploy is a manual promotion during the MVP. Confirm the actual script names in `package.json` once it exists — the above are the intended conventions, not verified scripts.
