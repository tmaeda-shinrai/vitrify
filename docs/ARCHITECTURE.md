# ARCHITECTURE — Arquitetura Técnica

## 1. Visão geral

Aplicação fullstack monolítica baseada em **Next.js 14 (App Router)** com backend serverless e banco gerenciado via **Supabase**. Arquitetura escolhida para minimizar complexidade operacional no MVP, com perfil de desenvolvedor iniciante/intermediário em mente.

```
┌─────────────────────────────────────────────────────┐
│              Cliente (Browser / PWA)                │
│  Next.js client + Service Worker + Web Share API    │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                      │
│   Next.js Server Components + Route Handlers        │
│   ISR para vitrines públicas (revalidate 60s)       │
└──────┬──────────────────────────────────┬───────────┘
       │                                  │
       ▼                                  ▼
┌──────────────┐              ┌────────────────────────┐
│   Supabase   │              │   Asaas / Pagar.me     │
│              │              │  (Gateway pagamento)   │
│  Postgres    │◄─── webhook ─┤                        │
│  Auth        │              └────────────────────────┘
│  Storage     │
│  Realtime    │
│  Edge Funcs  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Resend / SES    │  (Transacional: confirmação,
│  (E-mail)        │   recuperação de senha, faturas)
└──────────────────┘
```

## 2. Decisões técnicas e justificativas

### 2.1 Por que Next.js 14 com App Router?

- Server Components reduzem JavaScript no cliente, importante para o público em dispositivos modestos
- ISR (Incremental Static Regeneration) é perfeita para vitrines públicas: rápidas como página estática, atualizam quando o produto muda
- Mesmo framework para frontend e backend (route handlers) reduz contexto a aprender
- Comunidade enorme e excelente integração com Vercel

### 2.2 Por que Supabase em vez de Firebase ou backend próprio?

- Postgres real, com schema relacional, queries SQL e backups confiáveis
- Auth pronto com OAuth Google nativo e RLS (Row Level Security) que permite escrever regras de segurança no banco
- Storage com transformação de imagens nativa
- Região São Paulo disponível (importante para latência e LGPD)
- Free tier suficiente para os primeiros meses de MVP

### 2.3 Por que Asaas em vez de Stripe?

Discutido em detalhe em [PRICING.md](./PRICING.md). Em resumo: Stripe não aceita PIX recorrente bem, não emite NF automática para o Brasil, e cobra em USD com IOF. Asaas é nacional, aceita PIX, boleto e cartão recorrentes, e tem API simples.

### 2.4 Por que Vercel?

- Deploy automático integrado com Git
- CDN global incluso
- Free tier generoso para MVP
- Preview deploys por PR (ótimo para testar antes de mergear)
- Caso o tráfego vire um problema de custo, migração para Cloudflare Pages ou self-hosted é viável

### 2.5 Por que PWA em vez de app nativo?

- Tempo de desenvolvimento menor (uma codebase só)
- Atualizações instantâneas, sem aprovação de loja
- Suficiente para o caso de uso (não precisamos de câmera profunda nem hardware específico)
- Instalável tanto no Android quanto no iOS
- App nativo entra no roadmap pós-PMF se houver demanda real

## 3. Stack detalhada

### 3.1 Frontend

| Camada               | Ferramenta                  | Versão alvo       |
| -------------------- | --------------------------- | ----------------- |
| Framework            | Next.js                     | 14.x (App Router) |
| Linguagem            | TypeScript                  | 5.x               |
| Estilização          | Tailwind CSS                | 3.x               |
| Componentes          | shadcn/ui (Radix UI)        | latest            |
| Ícones               | Lucide React                | latest            |
| Forms                | React Hook Form + Zod       | latest            |
| Estado servidor      | TanStack Query              | 5.x               |
| Animações            | Framer Motion (uso pontual) | latest            |
| PWA                  | Serwist (`@serwist/next`)   | 9.x               |
| Compressão de imagem | browser-image-compression   | latest            |

### 3.2 Backend

| Camada        | Ferramenta                                 |
| ------------- | ------------------------------------------ |
| Runtime       | Node 20 (Vercel) + Edge Functions Supabase |
| Banco         | Postgres 15 (Supabase)                     |
| Auth          | Supabase Auth (JWT)                        |
| Storage       | Supabase Storage                           |
| ORM/Query     | Supabase Client + SQL puro quando preciso  |
| Validação     | Zod (compartilhado com frontend)           |
| E-mail        | Resend (transacional)                      |
| Pagamento     | Asaas (recorrência)                        |
| Observability | Sentry + Vercel Analytics + Plausible      |

### 3.3 DevOps e ferramentas

| Função                 | Ferramenta              |
| ---------------------- | ----------------------- |
| Versionamento          | Git + GitHub            |
| CI/CD                  | GitHub Actions + Vercel |
| Testes E2E             | Playwright              |
| Testes unitários       | Vitest                  |
| Lint/Format            | ESLint + Prettier       |
| Pre-commit             | Husky + lint-staged     |
| Gerenciador de pacotes | pnpm                    |

## 4. Estrutura de pastas

```
vitrine/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rotas de autenticação
│   │   ├── login/
│   │   ├── cadastro/
│   │   └── recuperar-senha/
│   ├── (dashboard)/              # Painel da vendedora
│   │   ├── produtos/
│   │   ├── pedidos/
│   │   ├── estatisticas/
│   │   └── conta/
│   ├── (public)/                 # Rotas públicas
│   │   └── [slug]/               # Vitrine pública (ISR)
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── asaas/            # Webhook de pagamento
│   │   ├── intent/               # Registro de intenção de pedido
│   │   └── [...]/
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui base
│   ├── product/                  # ProductCard, ProductForm
│   ├── vitrine/                  # VitrineHeader, etc.
│   └── shared/
├── lib/
│   ├── supabase/                 # Clients: server, browser, public (anon) e admin (service role)
│   ├── payments/                 # Abstração de gateway (PaymentGateway) + impl Asaas (#0018). `lib/asaas/` é stub vazio.
│   ├── billing/                  # Inadimplência: transições por tempo + limite efetivo da vitrine (#0019)
│   ├── email/                    # E-mails transacionais via Resend (#0019)
│   ├── validators/               # Schemas Zod
│   ├── utils/
│   └── analytics/
├── hooks/                        # React hooks customizados
├── types/                        # Tipos TS compartilhados
├── messages/                     # i18n (pt-BR.json)
├── public/
│   ├── icons/
│   └── manifest.json
├── styles/
│   └── globals.css
├── tests/
│   ├── e2e/
│   └── unit/
├── supabase/
│   ├── migrations/               # SQL versionado
│   ├── seed.sql
│   └── functions/                # Edge Functions
├── .env.example
├── docs/                         # Esta documentação
└── package.json
```

## 5. Fluxos críticos

### 5.1 Fluxo de cadastro de produto

```
1. Usuária preenche form com foto
2. Cliente comprime imagem (browser-image-compression):
   - max 1200px de largura
   - max 500KB de saída
   - converte para webp
3. Cliente faz upload direto ao Supabase Storage via signed URL
4. Cliente envia POST para /api/products com URL da imagem + dados
5. Server valida com Zod, checa limites do plano, insere no banco
6. Server retorna produto criado, cliente atualiza cache TanStack Query
7. Toast de sucesso, volta para lista
```

### 5.2 Fluxo de pedido via WhatsApp (intent)

```
1. Cliente final clica "Pedir no WhatsApp" em um produto
2. Frontend faz POST não-bloqueante para /api/intent com:
   - vitrine_slug
   - product_id
   - source (referrer, user-agent, timestamp)
3. Em paralelo, redireciona para wa.me/{whatsapp}?text={mensagem_pre_formatada}
4. /api/intent insere registro em order_intents (não espera resposta para liberar usuário)
5. Vendedora vê o registro no painel "Pedidos"
```

### 5.3 Fluxo de pagamento recorrente

```
1. Usuária clica "Assinar Pro"
2. Frontend chama /api/checkout
3. Server cria assinatura no Asaas via API, retorna link de pagamento
4. Usuária paga via PIX ou cartão na página do Asaas (ou iframe embed)
5. Asaas envia webhook para /api/webhooks/asaas
6. Server valida assinatura HMAC do webhook
7. Server atualiza tabela subscriptions com status "active"
8. Próximo acesso, usuária vê plano atualizado e novos limites
```

### 5.4 Renderização da vitrine pública (ISR)

```
1. Cliente acessa vitrinio.com.br/maria-silva
2. Vercel verifica cache:
   - Cache hit (< 60s): serve direto do edge (~50ms)
   - Cache miss ou stale: regera no servidor e serve
3. Server Component lê do Supabase (com select otimizado, só campos necessários)
4. HTML pré-renderizado vai para o cliente
5. Hidratação adiciona interatividade (modal de produto, etc.)
6. Quando produto é editado, action chama revalidatePath('/maria-silva')
```

## 6. Segurança

### 6.1 Row Level Security (RLS)

Todas as tabelas com dados de usuário têm RLS ativada. Políticas garantem que:

- Usuária só lê e edita seus próprios produtos, vitrine, configurações
- Vitrine pública só lê produtos com `is_active = true` da vitrine cujo `slug` corresponde
- Tabela `order_intents` permite INSERT público (anônimos), mas SELECT só para o dono da vitrine
- Tabela `subscriptions` é SELECT-only para o usuário, INSERT/UPDATE só por service role

### 6.2 Validação dupla

Toda input do usuário passa por validação Zod tanto no cliente (UX) quanto no servidor (segurança). Schemas vivem em `lib/validators` e são compartilhados.

### 6.3 Webhooks

O webhook do Asaas autentica pelo **token compartilhado** que o Asaas envia no header `asaas-access-token` (comparado contra `ASAAS_WEBHOOK_SECRET` em **tempo constante** — `node:crypto` `timingSafeEqual`; o Asaas não assina um HMAC do corpo). Idempotência garantida gravando o `event_id` na tabela `payment_webhook_events` (UNIQUE) **antes** de aplicar o efeito — reentrega do mesmo evento sai sem reprocessar; se o processamento falhar, o registro é desfeito para permitir o retry. Único handler com **service role** (a RLS de `subscriptions`/`invoices` não cobre essa escrita).

### 6.4 Limites e rate limiting

| Endpoint                | Limite                                     |
| ----------------------- | ------------------------------------------ |
| `/api/intent` (público) | 10 req/min por IP                          |
| `/api/products` POST    | 30 req/min por usuário                     |
| Login                   | 5 tentativas / 15 min por IP               |
| Upload de imagem        | 10 uploads / hora no Free, 100/hora no Pro |

Implementado via Upstash Redis ou rate-limit em memória do edge.

### 6.5 Conteúdo de usuário

- Sanitização de bio e descrição de produto contra XSS (DOMPurify ou react-markdown com whitelist)
- Imagens passam por verificação de tipo MIME no servidor antes de salvar
- Bloqueio de upload de SVG (vetor de XSS)
- Slug validado contra blacklist (admin, api, dashboard, login, etc.)

## 7. Performance

### 7.1 Metas

| Métrica           | Vitrine pública | Painel  |
| ----------------- | --------------- | ------- |
| LCP               | < 2.0s          | < 2.5s  |
| FID/INP           | < 200ms         | < 200ms |
| CLS               | < 0.05          | < 0.1   |
| Bundle JS inicial | < 100KB         | < 200KB |

### 7.2 Estratégias

- ISR na vitrine pública (revalidate 60s)
- Server Components por padrão; "use client" só quando necessário
- Imagens via `next/image` com loader do Supabase
- Fontes via `next/font` com `display: swap`
- Lazy loading dos componentes pesados (modais, gráficos do dashboard)
- Pré-carregamento (prefetch) das rotas linkadas no painel

## 8. Observabilidade

### 8.1 Logs

Estruturados em JSON, com `userId`, `requestId`, `route`, `level`. Coletados via Vercel Logs e Supabase Logs.

### 8.2 Métricas

- Vercel Analytics (Web Vitals reais)
- Plausible (page views, sem cookies)
- Supabase Dashboard (queries lentas, conexões)
- Custom: dashboard interno em `/admin` com DAU, MAU, conversão

### 8.3 Erros

Sentry com source maps. Alertas no Slack/Discord para erros críticos. Filtro de PII (nunca enviar e-mail, telefone, senha para Sentry).

Implementado (#0017): `@sentry/nextjs` com `sentry.{client,server,edge}.config.ts` carregadas via `instrumentation.ts`, `app/global-error.tsx` para erros de render, e `withSentryConfig` no `next.config.mjs` (upload de source maps só com `SENTRY_AUTH_TOKEN`). O scrubbing de PII é centralizado em `lib/observability/scrub.ts` (`beforeSend`/`beforeSendTransaction`): remove `user` (e-mail/usuário/IP), cookies/authorization e redige e-mail/telefone/CPF em message, querystring, breadcrumbs e extra — preservando stack traces. Sem `NEXT_PUBLIC_SENTRY_DSN` o SDK fica desabilitado (dev/local). Alertas no Slack/Discord ficam para #0024.

### 8.4 Alertas

| Condição                           | Canal          | Severidade |
| ---------------------------------- | -------------- | ---------- |
| Webhook Asaas falhando 3x seguidas | Slack          | Alta       |
| Banco com latência > 1s p95        | Slack          | Média      |
| Erro 5xx > 1% do tráfego           | Slack + e-mail | Alta       |
| Storage acima de 80% da quota      | E-mail         | Baixa      |

## 9. Deploy e ambientes

| Ambiente | URL                       | Branch      | Banco                   |
| -------- | ------------------------- | ----------- | ----------------------- |
| Local    | localhost:3000            | qualquer    | Supabase local (Docker) |
| Preview  | `preview-*.vercel.app`    | qualquer PR | Supabase staging        |
| Staging  | `staging.vitrinio.com.br` | `staging`   | Supabase staging        |
| Produção | `vitrinio.com.br`         | `main`      | Supabase produção       |

CI executa: typecheck, lint, testes unitários, testes E2E em preview.
Deploy para produção é manual (botão), mesmo com CI passando, durante MVP.

## 10. Backup e disaster recovery

- Backup automático diário do Postgres (Supabase, retenção 7 dias no plano free, 30 dias no plano Pro)
- Backup semanal exportado para storage externo (Wasabi ou S3) com retenção de 90 dias
- Restore testado mensalmente em ambiente de staging
- RTO alvo: 4 horas. RPO alvo: 24 horas

## 11. Custos estimados (mensal, ambiente produção)

Com até 1.500 usuárias ativas e tráfego de até 100k pageviews/mês:

| Serviço       | Plano                                                            | Custo estimado (USD) |
| ------------- | ---------------------------------------------------------------- | -------------------- |
| Vercel        | Hobby (free) ou Pro                                              | $0–$20               |
| Supabase      | Pro                                                              | $25                  |
| Resend        | Free (3k e-mails) ou Pro                                         | $0–$20               |
| Asaas         | Sem mensalidade, taxa por transação (~2.99% cartão, R$ 1,99 PIX) | variável             |
| Sentry        | Free tier                                                        | $0                   |
| Domínio + DNS | Cloudflare                                                       | $1                   |
| Total fixo    |                                                                  | **~$50–$80/mês**     |

Projeção: 100 usuárias pagas no Pro a R$ 39 já cobrem custo fixo + folga para tráfego pago.

## 12. Decisões registradas (ADRs)

ADRs (Architecture Decision Records) curtos devem ser criados na pasta `docs/adr/` para decisões importantes que afetam o longo prazo. Modelo simples:

```
# ADR-001: Uso de Supabase como BaaS

## Contexto
Precisamos de banco, auth e storage rapidamente, com perfil de dev iniciante.

## Decisão
Adotamos Supabase pelo conjunto integrado, RLS, e free tier generoso.

## Consequências
+ Velocidade de desenvolvimento alta
+ RLS força segurança no banco
- Vendor lock-in parcial (auth e storage)
- Risco de aumento de custo na escala
```

ADRs sugeridos para escrever no início:

- ADR-001: Supabase como BaaS
- ADR-002: Asaas como gateway de pagamento
- ADR-003: Next.js App Router em vez de Pages Router
- ADR-004: PWA em vez de app nativo
- ADR-005: ISR para vitrines públicas
