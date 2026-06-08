-- Migration: métricas agregadas do admin — #0023 (PR4)
-- Referência: issues/0023-administracao-interna-e-moderacao.md, docs/ARCHITECTURE.md §8.2,
-- docs/GTM.md §5. RPC SECURITY DEFINER chamada só pelo /admin (service role).
--
-- DAU/MAU: usuárias distintas com QUALQUER atividade auditada (audit_logs) na janela
-- de 1/30 dias — proxy pragmático de "ativo" (cobre login, edição de produto, etc.).
-- Funil: contagens do mensurável no servidor (cadastro → onboarding → ≥1 → ≥5 produtos
-- → plano pago).

CREATE OR REPLACE FUNCTION admin_metrics()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'dau', (
      SELECT count(DISTINCT actor_id) FROM public.audit_logs
      WHERE actor_id IS NOT NULL AND created_at >= now() - interval '1 day'
    ),
    'mau', (
      SELECT count(DISTINCT actor_id) FROM public.audit_logs
      WHERE actor_id IS NOT NULL AND created_at >= now() - interval '30 days'
    ),
    'signups', (SELECT count(*) FROM public.profiles),
    'onboarded', (SELECT count(*) FROM public.profiles WHERE onboarding_completed_at IS NOT NULL),
    'withProduct', (
      SELECT count(DISTINCT v.owner_id)
      FROM public.vitrines v JOIN public.products p ON p.vitrine_id = v.id
    ),
    'with5Products', (
      SELECT count(*) FROM (
        SELECT v.owner_id
        FROM public.vitrines v JOIN public.products p ON p.vitrine_id = v.id
        GROUP BY v.owner_id
        HAVING count(p.id) >= 5
      ) s
    ),
    'paid', (
      SELECT count(*) FROM public.subscriptions
      WHERE plan IN ('pro', 'plus') AND status IN ('active', 'trialing')
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION admin_metrics() FROM PUBLIC, anon, authenticated;
