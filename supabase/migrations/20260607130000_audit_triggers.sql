-- Migration: triggers de auditoria automática — #0021 (PR2)
-- Referência: issues/0021-conformidade-legal-lgpd.md, docs/LEGAL.md §3 (Marco Civil),
-- docs/DATABASE.md §2.10.
--
-- Registra automaticamente ações sensíveis em products/vitrines/profiles/subscriptions
-- (actor_id, action, entity_type/id, metadata, timestamp) — cumpre o Art. 15 do Marco
-- Civil (logs de criação/edição/exclusão de conteúdo + identificação da responsável).
--
-- ip_hash: o trigger lê o GUC `app.audit_ip_hash` quando presente. Como o PostgREST é
-- stateless (cada chamada é uma transação isolada no pooler), o GUC só chega ao trigger
-- quando a mutação roda DENTRO da mesma transação que o setou (caminho via RPC única) —
-- caso contrário fica nulo. O ip_hash confiável das sessões de painel é gravado no
-- evento `auth.login` (record_login_audit), onde a app tem o IP da requisição.

-- Função genérica de auditoria: monta action a partir de TG_TABLE_NAME + TG_OP.
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_entity TEXT;
  v_entity_id UUID;
  v_action TEXT;
  v_actor UUID := (select auth.uid());
  v_ip TEXT := nullif(current_setting('app.audit_ip_hash', true), '');
  v_metadata JSONB := NULL;
BEGIN
  v_entity := CASE TG_TABLE_NAME
    WHEN 'products' THEN 'product'
    WHEN 'vitrines' THEN 'vitrine'
    WHEN 'profiles' THEN 'profile'
    WHEN 'subscriptions' THEN 'subscription'
    ELSE TG_TABLE_NAME
  END;

  IF TG_OP = 'INSERT' THEN
    v_entity_id := NEW.id;
    v_action := v_entity || '.created';
  ELSIF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id;
    v_action := v_entity || '.deleted';
  ELSE
    v_entity_id := NEW.id;
    v_action := v_entity || '.updated';
  END IF;

  -- metadata de plano/status (só faz sentido para subscriptions UPDATE)
  IF TG_TABLE_NAME = 'subscriptions' AND TG_OP = 'UPDATE' THEN
    v_metadata := jsonb_build_object(
      'plan_from', OLD.plan, 'plan_to', NEW.plan,
      'status_from', OLD.status, 'status_to', NEW.status
    );
  END IF;

  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata, ip_hash)
  VALUES (v_actor, v_action, v_entity, v_entity_id, v_metadata, v_ip);

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

-- products: criação/edição/exclusão. O UPDATE só dispara em campos materiais —
-- exclui bumps de views_count/intents_count e reordenação (display_order).
CREATE TRIGGER audit_products_ins AFTER INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_products_del AFTER DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_products_upd AFTER UPDATE ON products
  FOR EACH ROW WHEN (
    OLD.name IS DISTINCT FROM NEW.name OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.price_cents IS DISTINCT FROM NEW.price_cents OR
    OLD.promo_price_cents IS DISTINCT FROM NEW.promo_price_cents OR
    OLD.is_available IS DISTINCT FROM NEW.is_available OR
    OLD.is_active IS DISTINCT FROM NEW.is_active OR
    OLD.category_id IS DISTINCT FROM NEW.category_id OR
    OLD.brand_id IS DISTINCT FROM NEW.brand_id
  ) EXECUTE FUNCTION log_audit_event();

-- vitrines: idem; UPDATE exclui o bump de views_count e is_default.
CREATE TRIGGER audit_vitrines_ins AFTER INSERT ON vitrines
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_vitrines_del AFTER DELETE ON vitrines
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_vitrines_upd AFTER UPDATE ON vitrines
  FOR EACH ROW WHEN (
    OLD.slug IS DISTINCT FROM NEW.slug OR
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.subtitle IS DISTINCT FROM NEW.subtitle OR
    OLD.hero_image_url IS DISTINCT FROM NEW.hero_image_url OR
    OLD.theme_primary IS DISTINCT FROM NEW.theme_primary OR
    OLD.theme_mode IS DISTINCT FROM NEW.theme_mode OR
    OLD.is_active IS DISTINCT FROM NEW.is_active
  ) EXECUTE FUNCTION log_audit_event();

-- profiles: só UPDATE de dados pessoais/estado sensível. Exclui referral_code,
-- referral_nudge_sent_at e updated_at (ruído de sistema).
CREATE TRIGGER audit_profiles_upd AFTER UPDATE ON profiles
  FOR EACH ROW WHEN (
    OLD.full_name IS DISTINCT FROM NEW.full_name OR
    OLD.avatar_url IS DISTINCT FROM NEW.avatar_url OR
    OLD.whatsapp IS DISTINCT FROM NEW.whatsapp OR
    OLD.bio IS DISTINCT FROM NEW.bio OR
    OLD.deletion_requested_at IS DISTINCT FROM NEW.deletion_requested_at OR
    OLD.terms_accepted_at IS DISTINCT FROM NEW.terms_accepted_at
  ) EXECUTE FUNCTION log_audit_event();

-- subscriptions: só mudança de plano ou status (não os ids/datas do gateway).
CREATE TRIGGER audit_subscriptions_upd AFTER UPDATE ON subscriptions
  FOR EACH ROW WHEN (
    OLD.plan IS DISTINCT FROM NEW.plan OR
    OLD.status IS DISTINCT FROM NEW.status
  ) EXECUTE FUNCTION log_audit_event();

-- Setter do ip_hash de auditoria (transaction-scoped, is_local=true → não vaza entre
-- requisições no pooler compartilhado). Útil no caminho de RPC única que muta + audita.
CREATE OR REPLACE FUNCTION set_audit_ip_hash(p_hash TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM set_config('app.audit_ip_hash', coalesce(p_hash, ''), true);
END;
$$;

REVOKE EXECUTE ON FUNCTION set_audit_ip_hash(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_audit_ip_hash(TEXT) TO authenticated;

-- Registra o acesso ao painel (login) com o hash do IP — fonte confiável de ip_hash
-- (Marco Civil §3.2 "IP de cada acesso ao painel"; resposta a incidentes §1.7).
CREATE OR REPLACE FUNCTION record_login_audit(p_ip_hash TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user UUID := (select auth.uid());
BEGIN
  IF v_user IS NULL THEN
    RETURN;
  END IF;
  INSERT INTO public.audit_logs (actor_id, action, ip_hash)
  VALUES (v_user, 'auth.login', nullif(p_ip_hash, ''));
END;
$$;

REVOKE EXECUTE ON FUNCTION record_login_audit(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION record_login_audit(TEXT) TO authenticated;
