-- Migration: marca de início da inadimplência — #0019 (PR5)
-- Referência: docs/PRICING.md §6.3 (past_due → graça → 14d esconde excedente → 30d Free).
--
-- O webhook seta past_due_since quando a assinatura entra em past_due e limpa quando
-- volta a pagar. As transições por tempo (D14 esconde excedente na vitrine — calculado
-- ao vivo; D30 rebaixa para Free) usam essa data como referência.

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS past_due_since TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_subscriptions_past_due
  ON subscriptions(past_due_since)
  WHERE past_due_since IS NOT NULL;
