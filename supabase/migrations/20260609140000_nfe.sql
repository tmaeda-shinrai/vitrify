-- Migration: NF-e automática (NFS-e) — #0025 (M7, última fatia de código)
-- Referência: issues/0025-beta-fechado-e-lancamento.md, docs/PRICING.md §7, docs/LEGAL.md §8.
--
-- Toda fatura paga gera uma NFS-e pelo módulo de NF-e do Asaas. A emissão é assíncrona:
-- `POST /api/cron/nfe` varre as faturas pagas ainda sem nota e manda emitir. O Asaas já
-- tem o cliente (CPF/CNPJ informado no checkout, forward-only — #0018), então NÃO
-- guardamos nenhum dado fiscal pessoal aqui, só a REFERÊNCIA da nota emitida.
-- Retenção fiscal de 5 anos: nfe_id/url acompanham o arquivamento não-PII (invoice_archive).

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nfe_status VARCHAR(20); -- NULL=pendente | 'issued' | 'failed'
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nfe_id VARCHAR(80);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nfe_url TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nfe_issued_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nfe_attempts SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS nfe_error TEXT;

-- A cron varre só faturas pagas ainda sem nota — índice parcial mantém isso barato.
CREATE INDEX IF NOT EXISTS idx_invoices_nfe_pending
  ON invoices (paid_at)
  WHERE status = 'paid' AND nfe_status IS NULL;

-- Retenção fiscal (5 anos): a referência da nota acompanha o arquivamento não-PII.
ALTER TABLE invoice_archive ADD COLUMN IF NOT EXISTS nfe_id VARCHAR(80);
ALTER TABLE invoice_archive ADD COLUMN IF NOT EXISTS nfe_url TEXT;

-- Reemite a função de exclusão definitiva (#0021) carregando a referência fiscal da nota.
CREATE OR REPLACE FUNCTION hard_delete_account(p_user UUID)
RETURNS void
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
    (asaas_payment_id, amount_cents, status, payment_method, paid_at, due_date, nfe_id, nfe_url)
  SELECT i.asaas_payment_id, i.amount_cents, i.status, i.payment_method, i.paid_at, i.due_date,
         i.nfe_id, i.nfe_url
  FROM public.invoices i
  JOIN public.subscriptions s ON s.id = i.subscription_id
  WHERE s.owner_id = p_user;

  DELETE FROM auth.users WHERE id = p_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION hard_delete_account(UUID) FROM PUBLIC, anon, authenticated;
