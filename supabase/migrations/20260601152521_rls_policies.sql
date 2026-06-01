-- Migration: Row Level Security (RLS) — #0004
-- Referência: docs/DATABASE.md §4 e docs/ARCHITECTURE.md §6.1.
-- Habilita RLS em todas as tabelas com dado de usuário e define as políticas.
--
-- Convenções:
--   - `(select auth.uid())` (subselect) para o planner avaliar uma vez por query.
--   - `TO authenticated` nas políticas de dona; `TO anon, authenticated` nas públicas.
--   - `service_role` tem BYPASSRLS → webhooks/admin acessam tudo sem política.
--   - Vitrine é PÚBLICA: qualquer um lê produto/categoria/marca/imagem ATIVOS de
--     vitrine ATIVA. As políticas de "dona" cobrem a gestão (insert/update/delete)
--     e a leitura de itens inativos/privados.

-- ============================================================================
-- profiles — só a própria dona lê/edita (vitrine pública busca contato via
-- service role no server, #0012). Criação é via trigger SECURITY DEFINER.
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- subscriptions — SELECT própria; INSERT/UPDATE só via service role (webhook Asaas).
-- ============================================================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================================================
-- vitrines — dona faz tudo na própria; público lê as ativas.
-- ============================================================================
ALTER TABLE vitrines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vitrines_owner_all" ON vitrines
  FOR ALL TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "vitrines_public_read" ON vitrines
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- ============================================================================
-- categories — dona gerencia; público lê as de vitrines ativas.
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_owner_all" ON categories
  FOR ALL TO authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())))
  WITH CHECK (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())));

CREATE POLICY "categories_public_read" ON categories
  FOR SELECT TO anon, authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE is_active = true));

-- ============================================================================
-- brands — dona gerencia; público lê as de vitrines ativas.
-- ============================================================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_owner_all" ON brands
  FOR ALL TO authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())))
  WITH CHECK (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())));

CREATE POLICY "brands_public_read" ON brands
  FOR SELECT TO anon, authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE is_active = true));

-- ============================================================================
-- products — dona gerencia; público lê ativos de vitrines ativas.
-- ============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_owner_all" ON products
  FOR ALL TO authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())))
  WITH CHECK (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())));

CREATE POLICY "products_public_read" ON products
  FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND vitrine_id IN (SELECT id FROM vitrines WHERE is_active = true)
  );

-- ============================================================================
-- product_images — segue o produto (join product→vitrine).
-- ============================================================================
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_images_owner_all" ON product_images
  FOR ALL TO authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN vitrines v ON v.id = p.vitrine_id
    WHERE v.owner_id = (select auth.uid())
  ))
  WITH CHECK (product_id IN (
    SELECT p.id FROM products p
    JOIN vitrines v ON v.id = p.vitrine_id
    WHERE v.owner_id = (select auth.uid())
  ));

CREATE POLICY "product_images_public_read" ON product_images
  FOR SELECT TO anon, authenticated
  USING (product_id IN (
    SELECT p.id FROM products p
    JOIN vitrines v ON v.id = p.vitrine_id
    WHERE p.is_active = true AND v.is_active = true
  ));

-- ============================================================================
-- order_intents — INSERT público (clique no botão); SELECT só da dona.
-- Validação/rate-limit do payload é feita na app (#0015); FKs garantem integridade.
-- ============================================================================
ALTER TABLE order_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_intents_public_insert" ON order_intents
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "order_intents_owner_read" ON order_intents
  FOR SELECT TO authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())));

-- ============================================================================
-- invoices — SELECT da dona (via subscription); escrita via service role.
-- ============================================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own" ON invoices
  FOR SELECT TO authenticated
  USING (subscription_id IN (SELECT id FROM subscriptions WHERE owner_id = (select auth.uid())));

-- ============================================================================
-- referrals — referrer lê/cria as próprias; conversão por service role.
-- ============================================================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select_own" ON referrals
  FOR SELECT TO authenticated
  USING (referrer_id = (select auth.uid()));

CREATE POLICY "referrals_insert_own" ON referrals
  FOR INSERT TO authenticated
  WITH CHECK (referrer_id = (select auth.uid()));

-- ============================================================================
-- coupons — sem política de usuário: leitura/escrita só via service role (#0018).
-- ============================================================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- coupon_redemptions — SELECT das próprias; escrita via service role.
-- ============================================================================
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupon_redemptions_select_own" ON coupon_redemptions
  FOR SELECT TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================================================
-- audit_logs — sem política de usuário: só service role/admin (#0023).
-- ============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- suggested_brands — dado de referência (autocomplete): leitura pública.
-- ============================================================================
ALTER TABLE suggested_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggested_brands_public_read" ON suggested_brands
  FOR SELECT TO anon, authenticated
  USING (true);
