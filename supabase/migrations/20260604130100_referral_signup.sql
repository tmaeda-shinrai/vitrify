-- Migration: geração de código + captura de indicação no cadastro — #0020 (PR1)
-- Referência: issues/0020-programa-de-indicacao.md, docs/PRICING.md §5.3.
--
-- Três peças, todas SECURITY DEFINER com search_path fixo (padrão do projeto):
--  1) ensure_referral_code(): gera/retorna o código opaco da usuária (sob demanda);
--  2) handle_new_user (CREATE OR REPLACE): no cadastro por e-mail, lê o código do
--     metadata e, se válido, dá 30 dias de Pro (trial) à indicada e grava o vínculo;
--  3) apply_referral(): mesma concessão para o cadastro via OAuth (Google), onde o
--     metadata não chega ao trigger — chamada no callback após a sessão existir,
--     guardada para só promover conta RECÉM-criada (não usuária existente).

-- 1) Código opaco por-usuária, gerado sob demanda e idempotente. Trava a linha do
--    profile (FOR UPDATE) para serializar chamadas concorrentes da mesma usuária;
--    retоrna o existente se já houver. Loop só em colisão (improvável) do índice único.
CREATE OR REPLACE FUNCTION ensure_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := (select auth.uid());
  v_existing TEXT;
  v_code TEXT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT referral_code INTO v_existing FROM public.profiles WHERE id = v_user FOR UPDATE;
  IF v_existing IS NOT NULL THEN
    RETURN v_existing;
  END IF;

  LOOP
    v_code := upper(substring(md5(gen_random_uuid()::text) FROM 1 FOR 8));
    BEGIN
      UPDATE public.profiles SET referral_code = v_code, updated_at = now()
      WHERE id = v_user;
      RETURN v_code;
    EXCEPTION
      WHEN unique_violation THEN
        -- colisão de código: tenta outro
    END;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION ensure_referral_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION ensure_referral_code() TO authenticated;

-- 2) Cadastro: profile + subscription + vitrine. Agora com captura de indicação:
--    se veio um referral_code válido de OUTRA usuária, a indicada entra com 30 dias
--    de Pro (trialing) e registramos referrals; senão, Free como antes.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_slug VARCHAR(40);
  v_ref_code TEXT := upper(trim(NEW.raw_user_meta_data ->> 'referral_code'));
  v_referrer UUID;
BEGIN
  -- profile básico
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuária'));

  -- resolve o referrer pelo código (se houver)
  IF v_ref_code IS NOT NULL AND v_ref_code <> '' THEN
    SELECT id INTO v_referrer FROM public.profiles WHERE referral_code = v_ref_code;
  END IF;

  IF v_referrer IS NOT NULL AND v_referrer <> NEW.id THEN
    -- indicada: 30 dias de Pro grátis (trial) em vez de cair direto no Free
    INSERT INTO public.subscriptions (owner_id, plan, status, current_period_start, current_period_end)
    VALUES (NEW.id, 'pro', 'trialing', now(), now() + interval '30 days');

    INSERT INTO public.referrals (referrer_id, referred_id, code)
    VALUES (v_referrer, NEW.id, v_ref_code)
    ON CONFLICT (referred_id) DO NOTHING;
  ELSE
    -- subscription gratuita ativa (caminho padrão)
    INSERT INTO public.subscriptions (owner_id, plan, status)
    VALUES (NEW.id, 'free', 'active');
  END IF;

  -- vitrine inativa com slug provisório (usuária troca no onboarding)
  v_slug := 'u-' || substring(NEW.id::text FROM 1 FOR 8);
  INSERT INTO public.vitrines (owner_id, slug, title, is_active)
  VALUES (NEW.id, v_slug, 'Minha Vitrine', FALSE);

  RETURN NEW;
END;
$$;

-- 3) OAuth: aplica a indicação após a sessão existir (o metadata não chega ao
--    trigger no Google). Promove SÓ conta nova (Free/ativa, criada há pouco, sem
--    indicação prévia) → impede usuária existente se auto-promover via ?ref=.
--    Bloqueia auto-indicação. Idempotente via referred_id UNIQUE. Devolve TRUE se aplicou.
CREATE OR REPLACE FUNCTION apply_referral(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := (select auth.uid());
  v_code TEXT := upper(trim(p_code));
  v_referrer UUID;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF v_code IS NULL OR v_code = '' THEN
    RETURN FALSE;
  END IF;

  SELECT id INTO v_referrer FROM public.profiles WHERE referral_code = v_code;
  IF v_referrer IS NULL OR v_referrer = v_user THEN
    RETURN FALSE; -- código inexistente ou auto-indicação
  END IF;

  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = v_user) THEN
    RETURN FALSE; -- já indicada
  END IF;

  -- só conta recém-criada e ainda Free/ativa ganha o trial (janela cobre o round-trip do OAuth)
  UPDATE public.subscriptions
  SET plan = 'pro',
      status = 'trialing',
      current_period_start = now(),
      current_period_end = now() + interval '30 days',
      updated_at = now()
  WHERE owner_id = v_user
    AND plan = 'free'
    AND status = 'active'
    AND created_at > now() - interval '30 minutes';
  IF NOT FOUND THEN
    RETURN FALSE; -- conta existente/não-elegível: não promove
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, code)
  VALUES (v_referrer, v_user, v_code)
  ON CONFLICT (referred_id) DO NOTHING;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION apply_referral(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION apply_referral(TEXT) TO authenticated;
