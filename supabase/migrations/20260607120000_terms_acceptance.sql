-- Migration: aceite de termos versionado no cadastro — #0021 (PR1)
-- Referência: issues/0021-conformidade-legal-lgpd.md, docs/LEGAL.md §4 (Termos).
--
-- Registra QUAL versão dos Termos/Privacidade a usuária aceitou e QUANDO. O cadastro
-- por e-mail manda `terms_version`/`terms_accepted_at` no metadata; o trigger
-- handle_new_user (CREATE OR REPLACE abaixo) os grava no profile. O gate de aceite
-- para OAuth/reaceite em mudança material vem em PR posterior (onboarding).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- handle_new_user: mantém a captura de indicação (#0020) e passa a gravar o aceite
-- de termos quando vier no metadata (cadastro por e-mail).
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
  v_terms_version TEXT := NEW.raw_user_meta_data ->> 'terms_version';
  v_terms_at TIMESTAMPTZ := (NEW.raw_user_meta_data ->> 'terms_accepted_at')::timestamptz;
BEGIN
  -- profile básico (+ aceite de termos quando presente no metadata)
  INSERT INTO public.profiles (id, full_name, terms_version, terms_accepted_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuária'),
    v_terms_version,
    v_terms_at
  );

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
