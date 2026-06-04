-- Migration: registro de eventos de webhook de pagamento (idempotência) — #0018
-- Referência: docs/ARCHITECTURE.md §6.3 (webhooks: HMAC + idempotência por event_id).
--
-- O webhook POST /api/webhooks/asaas grava aqui o id do evento ANTES de aplicar o
-- efeito. Um INSERT que viole o UNIQUE (event_id) indica reentrega do mesmo evento
-- → o handler sai sem reprocessar (fatura não duplica, efeito não reaplica). Só o
-- service role (handler do webhook) escreve: RLS habilitada e SEM policy.

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    VARCHAR(120) UNIQUE NOT NULL,
  event_type  VARCHAR(60),
  payment_id  VARCHAR(80),
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_payment
  ON payment_webhook_events(payment_id);

ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
