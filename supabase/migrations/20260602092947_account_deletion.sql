-- Migration: pedido de exclusão de conta (LGPD) — #0009
-- Referência: docs/LEGAL.md §1.4 (direitos) e §1.5 (retenção: anonimização 30d,
-- exclusão 90d).
--
-- Esta issue implementa o PEDIDO de exclusão (marca a conta + desativa a vitrine
-- no app). O agendamento dos jobs (anonimização aos 30d, exclusão aos 90d) fica
-- como follow-up de infra (pg_cron ou edge function cron). A função abaixo é a
-- parte de anonimização, pronta para ser chamada por esse job.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_deletion_requested
  ON profiles(deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL;

-- Anonimiza a PII de uma conta marcada para exclusão e desativa suas vitrines.
-- Chamada por um job agendado (≥30 dias após o pedido). SECURITY DEFINER para
-- rodar fora do contexto da usuária.
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
      bio = NULL
  WHERE id = p_user AND deletion_requested_at IS NOT NULL;

  UPDATE public.vitrines
  SET is_active = FALSE
  WHERE owner_id = p_user;
END;
$$;

-- Só o owner do banco / service_role executa (jobs agendados). Nunca o cliente.
REVOKE EXECUTE ON FUNCTION anonymize_account(UUID) FROM PUBLIC, anon, authenticated;

-- Pedido de exclusão feito pela própria usuária: marca a conta, tira a vitrine do
-- ar e registra na auditoria (audit_logs só aceita escrita de service role, daí o
-- SECURITY DEFINER). Atômico e usa auth.uid() — não recebe id de fora.
CREATE OR REPLACE FUNCTION request_account_deletion()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := (select auth.uid());
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  UPDATE public.profiles SET deletion_requested_at = now()
  WHERE id = v_user AND deletion_requested_at IS NULL;

  UPDATE public.vitrines SET is_active = FALSE WHERE owner_id = v_user;

  INSERT INTO public.audit_logs (actor_id, action)
  VALUES (v_user, 'account.deletion_requested');
END;
$$;

REVOKE EXECUTE ON FUNCTION request_account_deletion() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION request_account_deletion() TO authenticated;
