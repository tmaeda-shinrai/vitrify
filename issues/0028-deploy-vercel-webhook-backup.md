# [0028] Deploy na Vercel, webhook Asaas e backup

|                |                                     |
| -------------- | ----------------------------------- |
| **Milestone**  | M7 — Lançamento                     |
| **Roadmap**    | Fase 4 — Lançamento (Semanas 13–14) |
| **Prioridade** | Must                                |
| **Depende de** | #0027 (banco de produção pronto)    |

## Contexto

Com os serviços provisionados (#0026) e o banco pronto (#0027), esta issue **coloca o app no ar** em
`vitrinio.com.br`: configura as variáveis de ambiente na Vercel, associa o domínio, valida o build de produção,
promove o deploy, registra o webhook do Asaas e ativa o backup externo. Como o deploy é **produção direto**
(sem staging), o **preview deploy** da Vercel + um **smoke test** ponta-a-ponta são a rede de segurança antes
de promover.

O projeto Vercel já está linkado: `.vercel/project.json` (`vitrinio`, `prj_5vxM0mpTId4OBjADm48nCAxLTjHd`).

## Escopo

### Vercel — env vars e domínio

- Lançar em **Project Settings → Environment Variables** (escopo **Production**) todas as variáveis reunidas na
  #0026, mais: `NEXT_PUBLIC_APP_URL=https://vitrinio.com.br`, `NEXT_PUBLIC_APP_NAME=Vitrinio`,
  `NODE_ENV=production`, `FISCAL_PROVIDER=none` (vira `asaas` na #0029). Limites de plano (`LIMIT_*`) só se for
  sobrescrever os defaults do código.
- Associar o domínio `vitrinio.com.br` (+ redirect de `www`) em Settings → Domains; validar DNS/HTTPS.

### Build e promoção

- **Build de validação** local/CI com envs de produção antes de promover:
  `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. O `lib/env.ts` falha o build se faltar variável
  obrigatória; conferir que `public/sw.js` foi gerado (Serwist, só em `NODE_ENV=production`) e que o Sentry
  subiu source maps (requer `SENTRY_AUTH_TOKEN`).
- Conferir o **preview deploy** automático da Vercel (do PR/branch) e só então **promover para produção**
  (promoção manual durante o MVP — `docs/ARCHITECTURE.md` §9).

### Webhook Asaas

- No painel Asaas, registrar `https://vitrinio.com.br/api/webhooks/asaas` com o token = `ASAAS_WEBHOOK_SECRET`
  (autenticação por header `asaas-access-token`, comparação em tempo constante). Idempotência via
  `payment_webhook_events`. Handler: `app/api/webhooks/asaas/route.ts`.

### Backup externo

- Configurar os secrets do workflow `.github/workflows/backup.yml` (Settings → Secrets → Actions):
  `BACKUP_DB_URL`, `BACKUP_S3_BUCKET`, `BACKUP_S3_ENDPOINT` (Wasabi), `BACKUP_S3_REGION`,
  `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
- Criar o bucket Wasabi/S3 com regra de **lifecycle 90d** na pasta `weekly/`.
- Rodar via `workflow_dispatch` uma vez para confirmar que o dump sobe (a configuração do **teste de restore**
  fica no gate legal #0030).

### Health

- Abrir `/admin/health` (logado como `ADMIN_EMAILS`) e bater `GET /api/admin/health`: DB, Storage, Asaas e
  Resend devem reportar `ok`/`configurado`.

## Smoke test ponta-a-ponta (critério de aceite)

1. Vitrine pública (`/<slug>` de conta de teste) carrega com ISR e PWA instalável; Lighthouse mobile ≥ 90.
2. Cadastro e-mail → confirma e-mail (Resend chega) → onboarding → ativa vitrine.
3. Login com Google funciona (redirect URI ok).
4. Criar produto respeita o limite Free; "Pedir no WhatsApp" registra intent (painel Pedidos) e abre `wa.me`.
5. Checkout Asaas (valor baixo ou cupom) → pagar → webhook ativa o plano; e-mails de confirmação + recibo
   chegam; `/conta/plano` reflete o plano.
6. `POST /api/cron/health` com header `x-cron-secret` correto → 200; conferir `cron.job_run_details`.
7. Sentry recebe um erro de teste; Plausible registra pageview/eventos.
8. (Opcional) `pnpm load` (`tests/load/vitrine-launch.js`) contra a URL de produção — **nunca** `next dev`.

### Fora de escopo

- Ligar NF-e (`FISCAL_PROVIDER=asaas`) → #0029.
- Teste de restore do backup em ambiente isolado → #0030.

## Tarefas

- [ ] Env vars de produção lançadas na Vercel (escopo Production)
- [ ] Domínio `vitrinio.com.br` (+ `www`) associado, DNS/HTTPS válidos
- [ ] Build de produção verde localmente/CI; `public/sw.js` gerado; source maps no Sentry
- [ ] Preview deploy conferido e promovido para produção
- [ ] Webhook Asaas registrado e respondendo
- [ ] Secrets do backup configurados; bucket com lifecycle 90d; `workflow_dispatch` de teste ok
- [ ] `/admin/health` reportando tudo `ok`
- [ ] Smoke test ponta-a-ponta (1–7) verde

## Critérios de aceitação

- [ ] App acessível em `https://vitrinio.com.br` (HTTPS válido, sem warnings de mixed content)
- [ ] Smoke test ponta-a-ponta concluído com sucesso
- [ ] Webhook do Asaas confirmado (transação de teste ativa o plano e dispara e-mails)
- [ ] Backup semanal executou ao menos uma vez e o objeto está no bucket
- [ ] Rollback documentado: repromover o deploy anterior na Vercel (schema é append-only, app antigo compatível)

## Referências

- `.vercel/project.json`, `next.config.mjs` (Sentry/Serwist), `lib/env.ts`
- `app/api/webhooks/asaas/route.ts`, `app/api/admin/health/route.ts`
- `.github/workflows/backup.yml`, `docs/BACKUP.md`
- `docs/ARCHITECTURE.md` §9 (ambientes/deploy), §10 (backup, RTO 4h/RPO 24h)
- `tests/load/vitrine-launch.js`, `tests/load/README.md`
