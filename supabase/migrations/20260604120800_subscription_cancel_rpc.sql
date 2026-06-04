-- Migration: cancelamento self-service e downgrade por reembolso — #0019 (PR3)
-- Referência: docs/PRICING.md §6.1 (cancelamento), §6.2 (garantia/reembolso 7 dias).
--
-- A RLS de subscriptions é select-only para a dona; estas funções SECURITY DEFINER
-- alteram só a linha de auth.uid(). Espelham o padrão de request_account_deletion
-- (#0009): atômicas, sem id vindo de fora, e registram em audit_logs (que só aceita
-- escrita de service role). NUNCA tocam em produtos.

-- Cancelamento: marca canceled_at e mantém o acesso até current_period_end (o
-- downgrade efetivo ao fim do período é feito pelo cron de billing — PR5). Guarda a
-- pesquisa de saída (motivo/comentário) na auditoria.
CREATE OR REPLACE FUNCTION request_subscription_cancel(
  p_reason TEXT DEFAULT NULL,
  p_comment TEXT DEFAULT NULL
)
RETURNS void
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

  UPDATE public.subscriptions
  SET canceled_at = now(), updated_at = now()
  WHERE owner_id = v_user AND canceled_at IS NULL;

  INSERT INTO public.audit_logs (actor_id, action, metadata)
  VALUES (
    v_user,
    'plan.cancel_requested',
    jsonb_build_object('reason', p_reason, 'comment', p_comment)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION request_subscription_cancel(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION request_subscription_cancel(TEXT, TEXT) TO authenticated;

-- Downgrade imediato para Free (usado no reembolso da garantia de 7 dias): devolve
-- o dinheiro = encerra o acesso agora. Preserva os produtos (não toca em products).
CREATE OR REPLACE FUNCTION downgrade_to_free()
RETURNS void
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

  UPDATE public.subscriptions
  SET plan = 'free',
      status = 'canceled',
      canceled_at = now(),
      current_period_end = now(),
      updated_at = now()
  WHERE owner_id = v_user;

  INSERT INTO public.audit_logs (actor_id, action)
  VALUES (v_user, 'plan.refunded_downgrade');
END;
$$;

REVOKE EXECUTE ON FUNCTION downgrade_to_free() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION downgrade_to_free() TO authenticated;
