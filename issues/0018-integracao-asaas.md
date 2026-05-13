# [0018] Integração Asaas (camada de pagamento, checkout, webhook)

| | |
|---|---|
| **Milestone** | M5 — Pagamento e planos |
| **Roadmap** | Fase 3, Semana 9 |
| **Prioridade** | Must |
| **Planos** | Pro, Plus |
| **Depende de** | #0002 (Asaas sandbox + env), #0003 (`subscriptions`, `invoices`) |
| **Bloqueia** | #0019, #0020, #0025 |

## Contexto

Permitir cobrança recorrente real via **PIX, cartão e boleto** usando o **Asaas** (escolhido por PIX recorrente, NF-e integrável e taxas — `docs/PRICING.md` §3). A camada de pagamento deve ser abstraída para troca relativamente indolor por Pagar.me se necessário (`docs/PRICING.md` §3.2).

## Escopo

- **`lib/payments/`**: camada de abstração com interface neutra (criar cliente, criar/cancelar assinatura, consultar fatura) e a implementação `asaas` por baixo (cliente HTTP simples para `ASAAS_API_URL`). Trocar de gateway = trocar a implementação, não os call-sites.
- **Criação de cliente Asaas** no primeiro upgrade (guarda `subscriptions.asaas_customer_id`), coletando CPF/CNPJ para faturamento/NF-e.
- **Criação de assinatura recorrente**: planos **Pro (R$ 39/mês)** e **Plus (R$ 69/mês)** + opções anuais com -20% (Pro R$ 374,40; Plus R$ 662,40) — `docs/PRICING.md` §2; guarda `asaas_subscription_id`, `current_period_start/end`.
- **Página de checkout** (`/api/checkout` + tela): cria a assinatura no Asaas e mostra o pagamento — **PIX com QR Code**, cartão e boleto (iframe embed ou link do Asaas — decidir, registrar). Tratamento de falha (ex.: PIX não pago, cartão recusado) sem loop (`docs/CONTRIBUTING.md` exemplo de fix de checkout).
- **Webhook `POST /api/webhooks/asaas`**: valida **HMAC** com `ASAAS_WEBHOOK_SECRET` antes de processar; **idempotência** via `event_id` único (webhook duplicado não processa duas vezes — `docs/ARCHITECTURE.md` §6.3); atualiza `subscriptions.status` (`trialing`/`active`/`past_due`/`canceled`/`expired`) e popula `invoices` (`asaas_payment_id`, `amount_cents`, `status`, `payment_method`, `paid_at`, `due_date`, `invoice_url`).
- Uso de **service role** apenas neste route handler (RLS não cobre escrita em `subscriptions`/`invoices`).
- Logging estruturado dos eventos de pagamento, **sem PII** (nunca logar dados de cartão/CPF — `docs/CONTRIBUTING.md` §4).
- Criar os planos no painel Asaas e preencher `ASAAS_PLAN_PRO_MONTHLY_ID` / `_YEARLY_ID` / `ASAAS_PLAN_PLUS_*` (`.env.example`).

### Fora de escopo (vai em outra issue)

- Tela "Meu plano" (upgrade/downgrade/cancelamento self-service), histórico de faturas com PDF, comportamento de inadimplência/expiração, cupons, garantia de 7 dias, plano anual na UI → #0019
- Programa de indicação → #0020
- Emissão de NF-e automática → #0024
- Aviso de limite do Free com CTA (o gancho do modal já existe em #0010; a tela de comparação é #0019)

## Tarefas

- [ ] `lib/payments/` com interface neutra + implementação Asaas (cliente HTTP)
- [ ] Criação de cliente Asaas no 1º upgrade (CPF/CNPJ) → grava `asaas_customer_id`
- [ ] Criação de assinatura Pro/Plus (mensal e anual -20%) → grava `asaas_subscription_id`, períodos
- [ ] `/api/checkout` + tela de checkout: PIX (QR Code), cartão, boleto; tratamento de falha sem loop
- [ ] `POST /api/webhooks/asaas`: validação HMAC + idempotência por `event_id`
- [ ] Webhook atualiza `subscriptions.status` e insere/atualiza `invoices`
- [ ] Service role isolado neste handler; logs sem PII
- [ ] Criar planos no painel Asaas; preencher IDs no `.env`/Vercel
- [ ] Testes (sandbox): assinatura criada; webhook de pagamento confirmado atualiza status; webhook duplicado é idempotente; HMAC inválido é rejeitado

## Critérios de aceitação

- [ ] Usuária consegue assinar o Pro pagando via PIX (QR Code) no sandbox; status vira `active` via webhook
- [ ] Webhook com HMAC inválido é recusado; webhook repetido não duplica fatura nem reaplica efeito
- [ ] `invoices` reflete a cobrança (valor, método, vencimento, URL da fatura)
- [ ] Trocar a implementação de gateway não exige mudar quem chama `lib/payments/`
- [ ] Nenhum dado de cartão/CPF aparece em logs
- [ ] Critérios genéricos de aceitação (ver `issues/README.md`)

## Referências

- `docs/PRICING.md` §2 (planos e preços), §3 (escolha do gateway, Pagar.me como backup), §3.2 (`lib/payments/`)
- `docs/ARCHITECTURE.md` §2.3 (por que Asaas), §5.3 (fluxo de pagamento recorrente), §6.3 (webhooks)
- `docs/DATABASE.md` §2.8 (`subscriptions`), §2.9 (`invoices`), §4.5 (RLS)
- `docs/CONTRIBUTING.md` §4 (segurança, webhooks HMAC/idempotência), §7 (env)
- `.env.example` (variáveis `ASAAS_*`)
- `docs/ROADMAP.md` Fase 3, Semana 9
