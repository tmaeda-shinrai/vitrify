-- Migration: validação e resgate de cupons — #0019 (PR4)
-- Referência: docs/PRICING.md §5.2 (cupons). Tabelas coupons/coupon_redemptions já
-- existem (schema inicial). Estas funções SECURITY DEFINER fazem a leitura/escrita
-- (coupons não tem RLS pública) restritas a auth.uid(): validam janela, limite global
-- (max_redemptions) e por usuária (UNIQUE coupon_id+owner_id), e plano elegível.

-- Validação read-only: devolve a linha do cupom se aplicável à usuária/plano; vazio se não.
CREATE OR REPLACE FUNCTION validate_coupon(p_code TEXT, p_plan subscription_plan)
RETURNS TABLE (code TEXT, discount_type public.coupon_discount_type, discount_value INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := (select auth.uid());
  v_code TEXT := upper(trim(p_code));
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT c.code, c.discount_type, c.discount_value
  FROM public.coupons c
  WHERE c.code = v_code
    AND c.is_active
    AND (c.valid_from IS NULL OR c.valid_from <= now())
    AND (c.valid_until IS NULL OR c.valid_until >= now())
    AND (c.max_redemptions IS NULL OR c.redemptions_count < c.max_redemptions)
    AND (c.applies_to_plan IS NULL OR c.applies_to_plan = p_plan)
    AND NOT EXISTS (
      SELECT 1 FROM public.coupon_redemptions r
      WHERE r.coupon_id = c.id AND r.owner_id = v_user
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION validate_coupon(TEXT, subscription_plan) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, subscription_plan) TO authenticated;

-- Resgate atômico: trava a linha do cupom, revalida os limites, registra o resgate
-- (o UNIQUE coupon_id+owner_id barra repetição) e incrementa o contador. Devolve
-- FALSE se inválido/limite estourado/já resgatado.
CREATE OR REPLACE FUNCTION redeem_coupon(p_code TEXT, p_subscription_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := (select auth.uid());
  v_code TEXT := upper(trim(p_code));
  v_coupon public.coupons;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_coupon FROM public.coupons WHERE code = v_code FOR UPDATE;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF NOT v_coupon.is_active
     OR (v_coupon.valid_from IS NOT NULL AND v_coupon.valid_from > now())
     OR (v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now())
     OR (v_coupon.max_redemptions IS NOT NULL AND v_coupon.redemptions_count >= v_coupon.max_redemptions)
  THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.coupon_redemptions (coupon_id, owner_id, subscription_id)
  VALUES (v_coupon.id, v_user, p_subscription_id);

  UPDATE public.coupons
  SET redemptions_count = redemptions_count + 1, updated_at = now()
  WHERE id = v_coupon.id;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RETURN FALSE; -- já resgatado por esta usuária
END;
$$;

REVOKE EXECUTE ON FUNCTION redeem_coupon(TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION redeem_coupon(TEXT, UUID) TO authenticated;
