-- Migration: schema inicial do MVP (Vitrinio)
-- Referência: docs/DATABASE.md §2 (tabelas) e §3 (triggers/funções).
-- Escopo desta migration (#0003): tabelas, enums, índices, funções e triggers.
-- Fora de escopo: políticas RLS (#0004), triggers de audit_logs (#0021).
--
-- Convenções: PKs uuid (gen_random_uuid), preços em centavos (INT),
-- timestamps timestamptz com default now(). Postgres 15+ (provisionado: 17).

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'plus');
CREATE TYPE coupon_discount_type AS ENUM ('percent', 'fixed_cents', 'free_days');

-- ============================================================================
-- profiles  (§2.1) — estende auth.users, criada via trigger no signup
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  avatar_url TEXT,
  whatsapp VARCHAR(20),                       -- E.164 sem '+', ex: '5567999999999'
  whatsapp_verified_at TIMESTAMPTZ,
  bio TEXT CHECK (char_length(bio) <= 160),
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_whatsapp ON profiles(whatsapp);

-- ============================================================================
-- subscriptions  (§2.8) — 1:1 com profiles
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  asaas_subscription_id VARCHAR(80),
  asaas_customer_id VARCHAR(80),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- vitrines  (§2.2)
-- ============================================================================

CREATE TABLE vitrines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug VARCHAR(40) NOT NULL,
  title VARCHAR(80) NOT NULL,
  subtitle VARCHAR(120),
  hero_image_url TEXT,
  theme_primary VARCHAR(7) DEFAULT '#7C3AED',
  theme_mode VARCHAR(10) DEFAULT 'auto' CHECK (theme_mode IN ('light', 'dark', 'auto')),
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT TRUE,
  views_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- slug: minúsculas, números e hífen, 3 a 40 chars (blacklist de reservados na app)
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$')
);

CREATE UNIQUE INDEX idx_vitrines_slug ON vitrines(slug);
CREATE INDEX idx_vitrines_owner ON vitrines(owner_id);

-- ============================================================================
-- categories  (§2.3) — por vitrine
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (vitrine_id, name)
);

CREATE INDEX idx_categories_vitrine ON categories(vitrine_id);

-- ============================================================================
-- brands  (§2.4) — por vitrine
-- ============================================================================

CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (vitrine_id, name)
);

-- suggested_brands — auxiliar, somente leitura, populada via migration de seed
CREATE TABLE suggested_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- products  (§2.5) — preços em centavos; busca full-text em português
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT CHECK (char_length(description) <= 1000),
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  promo_price_cents INT CHECK (promo_price_cents IS NULL OR promo_price_cents < price_cents),
  is_available BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  views_count BIGINT DEFAULT 0,
  intents_count BIGINT DEFAULT 0,
  search_text TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('portuguese', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_vitrine ON products(vitrine_id);
CREATE INDEX idx_products_search ON products USING GIN(search_text);
CREATE INDEX idx_products_active ON products(vitrine_id, is_active) WHERE is_active = TRUE;

-- ============================================================================
-- product_images  (§2.6) — limite de 5/produto validado na aplicação
-- ============================================================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(120),
  display_order INT DEFAULT 0,
  width INT,
  height INT,
  size_bytes INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================================================
-- order_intents  (§2.7) — clique em "Pedir no WhatsApp"
-- LGPD: armazena hash do IP (nunca o IP) e user agent resumido.
-- ============================================================================

CREATE TABLE order_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  source VARCHAR(50),                         -- 'instagram', 'whatsapp', 'direct', etc.
  user_agent_short VARCHAR(50),               -- 'mobile-android', 'mobile-ios', 'desktop'
  ip_hash VARCHAR(64),                        -- SHA-256 do IP (dedupe sem armazenar PII)
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_intents_vitrine_date ON order_intents(vitrine_id, created_at DESC);
CREATE INDEX idx_intents_product ON order_intents(product_id);

-- ============================================================================
-- invoices  (§2.9) — sincronizado via webhook do Asaas
-- ============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  asaas_payment_id VARCHAR(80) UNIQUE NOT NULL,
  amount_cents INT NOT NULL,
  status VARCHAR(20) NOT NULL,                -- 'pending', 'paid', 'overdue', 'refunded'
  payment_method VARCHAR(20),                 -- 'pix', 'credit_card', 'boleto'
  paid_at TIMESTAMPTZ,
  due_date DATE NOT NULL,
  invoice_url TEXT,                           -- URL para PDF da fatura
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_subscription ON invoices(subscription_id, created_at DESC);

-- ============================================================================
-- audit_logs  (§2.10) — ações sensíveis (registro automático fica na #0021)
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,                -- 'product.created', 'plan.upgraded', etc.
  entity_type VARCHAR(40),
  entity_id UUID,
  metadata JSONB,
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor_date ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ============================================================================
-- referrals  (§2.11) — programa de indicação (lógica na #0020)
-- ============================================================================

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  converted_at TIMESTAMPTZ,                   -- quando a indicada virou pagante
  reward_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- coupons / coupon_redemptions  (docs/PRICING.md §5.2 — lógica na #0018)
-- Limite global via max_redemptions/redemptions_count; limite por usuária = 1
-- (garantido pela UNIQUE em coupon_redemptions).
-- ============================================================================

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) UNIQUE NOT NULL,           -- normalizado em maiúsculas na app
  description VARCHAR(200),
  discount_type coupon_discount_type NOT NULL,
  discount_value INT NOT NULL CHECK (discount_value > 0),  -- % (1-100), centavos ou dias
  applies_to_plan subscription_plan,          -- NULL = qualquer plano
  max_redemptions INT CHECK (max_redemptions IS NULL OR max_redemptions > 0),  -- NULL = ilimitado
  redemptions_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT coupons_percent_range CHECK (
    discount_type <> 'percent' OR discount_value BETWEEN 1 AND 100
  ),
  CONSTRAINT coupons_valid_window CHECK (
    valid_from IS NULL OR valid_until IS NULL OR valid_until > valid_from
  )
);

CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;

CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (coupon_id, owner_id)
);

CREATE INDEX idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);
CREATE INDEX idx_coupon_redemptions_owner ON coupon_redemptions(owner_id);

-- ============================================================================
-- FUNÇÕES E TRIGGERS  (§3)
-- search_path fixo em todas as funções (recomendação de segurança Supabase).
-- ============================================================================

-- §3.1 — auto-criação de profile + subscription + vitrine no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_slug VARCHAR(40);
BEGIN
  -- profile básico
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuária'));

  -- subscription gratuita ativa
  INSERT INTO public.subscriptions (owner_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  -- vitrine inativa com slug provisório (usuária troca no onboarding)
  v_slug := 'u-' || substring(NEW.id::text FROM 1 FOR 8);
  INSERT INTO public.vitrines (owner_id, slug, title, is_active)
  VALUES (NEW.id, v_slug, 'Minha Vitrine', FALSE);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- §3.2 — atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON vitrines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- §3.3 — bloquear 6º produto ativo no plano free
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_plan public.subscription_plan;
  v_count INT;
  v_owner UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM public.vitrines WHERE id = NEW.vitrine_id;
  SELECT plan INTO v_plan FROM public.subscriptions WHERE owner_id = v_owner;

  IF v_plan = 'free' THEN
    SELECT COUNT(*) INTO v_count
    FROM public.products p
    JOIN public.vitrines v ON v.id = p.vitrine_id
    WHERE v.owner_id = v_owner AND p.is_active = TRUE;

    IF v_count >= 5 THEN
      RAISE EXCEPTION 'PLAN_LIMIT_REACHED' USING HINT = 'Plano Free permite até 5 produtos';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION check_product_limit();
