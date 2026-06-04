-- Migration: RPC para gravar as ids do Asaas no checkout — #0018 (PR2)
-- Referência: docs/DATABASE.md §4.5 (subscriptions é select-only para a dona).
--
-- A RLS de subscriptions não tem policy de UPDATE para a usuária (status/plan só
-- mudam via webhook, com service role). O checkout, porém, precisa gravar o
-- asaas_customer_id e o asaas_subscription_id + período na própria linha. Esta
-- função SECURITY DEFINER faz só isso, restrita à linha de auth.uid(): NÃO toca em
-- plan nem em status (esses continuam exclusivos do webhook). COALESCE permite
-- chamar duas vezes (após criar o cliente; depois após criar a assinatura) sem
-- sobrescrever o que já foi gravado.

CREATE OR REPLACE FUNCTION attach_asaas_checkout(
  p_customer_id TEXT DEFAULT NULL,
  p_subscription_id TEXT DEFAULT NULL,
  p_period_start TIMESTAMPTZ DEFAULT NULL,
  p_period_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.subscriptions
  SET
    asaas_customer_id = COALESCE(p_customer_id, asaas_customer_id),
    asaas_subscription_id = COALESCE(p_subscription_id, asaas_subscription_id),
    current_period_start = COALESCE(p_period_start, current_period_start),
    current_period_end = COALESCE(p_period_end, current_period_end),
    updated_at = now()
  WHERE owner_id = (select auth.uid());
END;
$$;

REVOKE EXECUTE ON FUNCTION attach_asaas_checkout(TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION attach_asaas_checkout(TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ)
  TO authenticated;
