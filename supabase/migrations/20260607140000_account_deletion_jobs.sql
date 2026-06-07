-- Migration: ciclo de vida da exclusão de conta — #0021 (PR3)
-- Referência: issues/0021-conformidade-legal-lgpd.md, docs/LEGAL.md §1.5.
--
-- Conclui o follow-up da #0009: anonimização aos 30 dias e exclusão definitiva aos
-- 90 dias do pedido. Os jobs são disparados pelo POST /api/cron/retention (service
-- role). A retenção fiscal de 5 anos (§1.5) é preservada arquivando os campos NÃO-PII
-- das faturas antes do hard delete (que cascateia invoices junto com a usuária).

-- Marca quando a conta foi anonimizada (idempotência do job dos 30 dias).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- Arquivo fiscal sem PII (sem owner, e-mail, CPF ou invoice_url/PDF). Mantém só o
-- necessário p/ contabilidade; o registro completo segue na Asaas (asaas_payment_id).
-- Sem política RLS → acessível apenas por service role.
CREATE TABLE IF NOT EXISTS invoice_archive (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asaas_payment_id VARCHAR(80),
  amount_cents INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  payment_method VARCHAR(20),
  paid_at TIMESTAMPTZ,
  due_date DATE,
  archived_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invoice_archive ENABLE ROW LEVEL SECURITY;

-- anonymize_account: agora carimba anonymized_at. SECURITY DEFINER, service role.
CREATE OR REPLACE FUNCTION anonymize_account(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET full_name = 'Conta removida',
      avatar_url = NULL,
      whatsapp = NULL,
      whatsapp_verified_at = NULL,
      bio = NULL,
      anonymized_at = now()
  WHERE id = p_user AND deletion_requested_at IS NOT NULL AND anonymized_at IS NULL;

  UPDATE public.vitrines
  SET is_active = FALSE
  WHERE owner_id = p_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION anonymize_account(UUID) FROM PUBLIC, anon, authenticated;

-- hard_delete_account: exclusão definitiva ≥90 dias após o pedido. Arquiva o fiscal
-- e apaga auth.users (cascateia profiles/subscriptions/invoices/vitrines/products).
-- audit_logs.actor_id é ON DELETE SET NULL → o histórico de auditoria sobrevive.
-- Idempotente: após o delete o profile some e o EXISTS falha.
CREATE OR REPLACE FUNCTION hard_delete_account(p_user UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user
      AND deletion_requested_at IS NOT NULL
      AND deletion_requested_at <= now() - interval '90 days'
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.invoice_archive
    (asaas_payment_id, amount_cents, status, payment_method, paid_at, due_date)
  SELECT i.asaas_payment_id, i.amount_cents, i.status, i.payment_method, i.paid_at, i.due_date
  FROM public.invoices i
  JOIN public.subscriptions s ON s.id = i.subscription_id
  WHERE s.owner_id = p_user;

  DELETE FROM auth.users WHERE id = p_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION hard_delete_account(UUID) FROM PUBLIC, anon, authenticated;
