# DATABASE — Schema, RLS e Migrações

Schema desenhado para Postgres 15+ (Supabase — instâncias atuais provisionam o 17). Todas as tabelas usam `uuid` como chave primária (gerada com `gen_random_uuid()`) e timestamps `created_at` / `updated_at` com defaults.

## 1. Diagrama lógico

```
auth.users (Supabase Auth, gerenciado)
   │
   │ 1:1
   ▼
profiles ────────── 1:1 ──── subscriptions
   │                              │
   │ 1:N                          │ 1:N
   ▼                              ▼
vitrines                      invoices
   │
   ├── 1:N ──► products ──── 1:N ──► product_images
   │                  │
   │                  └─── 1:N ──► order_intents
   │
   ├── 1:N ──► categories
   └── 1:N ──► brands

audit_logs (cross-cutting, para admin)
coupons ──< coupon_redemptions (cross-cutting, billing — #0018)
```

## 2. Tabelas

### 2.1 `profiles`

Estende `auth.users`. Criada via trigger quando um usuário se cadastra.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(120) NOT NULL,
  avatar_url TEXT,
  whatsapp VARCHAR(20),                    -- formato E.164 sem o '+', ex: '5567999999999'
  whatsapp_verified_at TIMESTAMPTZ,
  bio TEXT CHECK (char_length(bio) <= 160),
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_whatsapp ON profiles(whatsapp);
```

### 2.2 `vitrines`

Cada usuária tem ao menos uma vitrine. Free e Pro têm uma; Plus pode ter até três.

```sql
CREATE TABLE vitrines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug VARCHAR(40) UNIQUE NOT NULL,
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
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$')
);

CREATE UNIQUE INDEX idx_vitrines_slug ON vitrines(slug);
CREATE INDEX idx_vitrines_owner ON vitrines(owner_id);
```

Slug com restrição: minúsculas, números e hífen, entre 3 e 40 caracteres. Blacklist de slugs reservados (admin, api, dashboard, login, cadastro, etc.) é validada na aplicação antes do INSERT.

### 2.3 `categories`

Categorias por vitrine (não global), criadas livremente pela usuária.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (vitrine_id, name)
);

CREATE INDEX idx_categories_vitrine ON categories(vitrine_id);
```

### 2.4 `brands`

Marcas reutilizadas entre produtos (Avon, Natura, Hinode, etc.). Por vitrine.

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (vitrine_id, name)
);
```

Tabela auxiliar `suggested_brands` (somente leitura, populada via seed) para sugerir marcas comuns no autocomplete.

### 2.5 `products`

```sql
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
```

Preços armazenados em centavos (`INT`) para evitar problemas de ponto flutuante. Conversão para `R$ 32,90` é feita na camada de apresentação.

### 2.6 `product_images`

```sql
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
```

Limite de 5 imagens por produto validado na aplicação.

### 2.7 `order_intents`

Registro de cada clique no botão "Pedir no WhatsApp". É a "moeda" que valida a vitrine para a vendedora.

```sql
CREATE TABLE order_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  source VARCHAR(50),                       -- 'instagram', 'whatsapp', 'direct', etc.
  user_agent_short VARCHAR(50),             -- 'mobile-android', 'mobile-ios', 'desktop'
  ip_hash VARCHAR(64),                      -- SHA-256 do IP para deduplicação sem armazenar PII
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_intents_vitrine_date ON order_intents(vitrine_id, created_at DESC);
CREATE INDEX idx_intents_product ON order_intents(product_id);
```

Atenção LGPD: armazenamos hash do IP, não o IP em si. User agent é resumido em uma de poucas categorias para evitar fingerprinting.

### 2.8 `subscriptions`

```sql
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'plus');

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
```

### 2.9 `invoices`

Histórico de cobranças. Sincronizado via webhook do Asaas.

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  asaas_payment_id VARCHAR(80) UNIQUE NOT NULL,
  amount_cents INT NOT NULL,
  status VARCHAR(20) NOT NULL,              -- 'pending', 'paid', 'overdue', 'refunded'
  payment_method VARCHAR(20),               -- 'pix', 'credit_card', 'boleto'
  paid_at TIMESTAMPTZ,
  due_date DATE NOT NULL,
  invoice_url TEXT,                         -- URL para PDF da fatura
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_invoices_subscription ON invoices(subscription_id, created_at DESC);
```

### 2.10 `audit_logs`

Para suporte e diagnóstico. Registra ações sensíveis.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,              -- 'product.created', 'plan.upgraded', etc.
  entity_type VARCHAR(40),
  entity_id UUID,
  metadata JSONB,
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_actor_date ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action);
```

Retenção: 180 dias, com job de limpeza automático.

### 2.11 `referrals`

Programa de indicação (1 mês grátis por amiga indicada que assina o Pro+).

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  converted_at TIMESTAMPTZ,                 -- quando a indicada virou pagante
  reward_granted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.12 `coupons`

Cupons promocionais (`docs/PRICING.md` §5.2). Limite global via `max_redemptions`/`redemptions_count`; limite por usuária é de uma redenção (garantido pela `UNIQUE` em `coupon_redemptions`). Lógica de aplicação no checkout fica na #0018.

```sql
CREATE TYPE coupon_discount_type AS ENUM ('percent', 'fixed_cents', 'free_days');

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(40) UNIQUE NOT NULL,            -- normalizado em maiúsculas na aplicação
  description VARCHAR(200),
  discount_type coupon_discount_type NOT NULL,
  discount_value INT NOT NULL CHECK (discount_value > 0),  -- % (1-100), centavos ou dias
  applies_to_plan subscription_plan,           -- NULL = qualquer plano
  max_redemptions INT CHECK (max_redemptions IS NULL OR max_redemptions > 0),  -- NULL = ilimitado
  redemptions_count INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT coupons_percent_range CHECK (discount_type <> 'percent' OR discount_value BETWEEN 1 AND 100),
  CONSTRAINT coupons_valid_window CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_until > valid_from)
);

CREATE INDEX idx_coupons_active ON coupons(is_active) WHERE is_active = TRUE;
```

### 2.13 `coupon_redemptions`

Registro de uso de cupom por usuária. `UNIQUE (coupon_id, owner_id)` impede dupla redenção.

```sql
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
```

### 2.14 `vitrine_daily_stats`

Rollup diário de visualizações e cliques por vitrine (#0016): alimenta as janelas de 7/30 dias e o gráfico temporal do painel de Estatísticas sem guardar PII por evento — é o "vitrine_stats agregado por dia" antes listado como otimização futura (§8). O total all-time de views continua em `vitrines.views_count`; o detalhe por evento dos cliques continua em `order_intents`.

```sql
CREATE TABLE vitrine_daily_stats (
  vitrine_id    UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  stat_date     DATE NOT NULL,             -- bucket no fuso America/Sao_Paulo
  views_count   INTEGER NOT NULL DEFAULT 0,
  intents_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (vitrine_id, stat_date)
);

CREATE INDEX idx_daily_stats_vitrine_date ON vitrine_daily_stats(vitrine_id, stat_date DESC);
```

Escrita só por funções `SECURITY DEFINER` (o cliente anônimo não pode dar UPDATE): a RPC `increment_vitrine_views(slug)` faz upsert das views do dia (além do contador total) e o trigger `bump_vitrine_daily_intents` (ver §3.4) faz upsert dos cliques do dia. RLS: `daily_stats_owner_read` (a dona lê os agregados das próprias vitrines; sem policy de escrita).

## 3. Triggers e funções

### 3.1 Auto-criação de profile e vitrine no signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_slug VARCHAR(40);
BEGIN
  -- Cria profile básico
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuária'));

  -- Cria subscription gratuita
  INSERT INTO subscriptions (owner_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  -- Cria vitrine vazia (slug inicial baseado no id, usuária troca depois)
  v_slug := 'u-' || substring(NEW.id::text from 1 for 8);
  INSERT INTO vitrines (owner_id, slug, title, is_active)
  VALUES (NEW.id, v_slug, 'Minha Vitrine', FALSE);  -- inativa até completar onboarding

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3.2 Atualizar `updated_at` automaticamente

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas as tabelas com updated_at:
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- ... repetir para vitrines, products, subscriptions
```

### 3.3 Verificar limite de produtos do plano

```sql
CREATE OR REPLACE FUNCTION check_product_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_plan subscription_plan;
  v_count INT;
  v_owner UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM vitrines WHERE id = NEW.vitrine_id;
  SELECT plan INTO v_plan FROM subscriptions WHERE owner_id = v_owner;

  IF v_plan = 'free' THEN
    SELECT COUNT(*) INTO v_count
    FROM products p
    JOIN vitrines v ON v.id = p.vitrine_id
    WHERE v.owner_id = v_owner AND p.is_active = TRUE;

    IF v_count >= 5 THEN
      RAISE EXCEPTION 'PLAN_LIMIT_REACHED' USING HINT = 'Plano Free permite até 5 produtos';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_product_limit
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION check_product_limit();
```

### 3.4 Contadores de engajamento (#0015–#0016)

Mantidos por `SECURITY DEFINER` para rodar acima da RLS (o registro vem de cliente anônimo):

- `bump_product_intents` — trigger AFTER INSERT em `order_intents`; soma +1 em `products.intents_count` quando há `product_id` (#0015).
- `increment_vitrine_views(slug)` — RPC chamada por `/api/view`; soma +1 em `vitrines.views_count` (total) e faz upsert da contagem de views do dia em `vitrine_daily_stats` (#0015/#0016).
- `bump_vitrine_daily_intents` — trigger AFTER INSERT em `order_intents`; faz upsert da contagem de cliques do dia em `vitrine_daily_stats`, contando **todos** os intents (inclusive `product_id` nulo do FAB geral) (#0016).

## 4. Row Level Security (RLS)

RLS é ativada em todas as tabelas com dados de usuário. Exemplos das principais políticas:

### 4.1 `profiles`

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### 4.2 `vitrines`

```sql
ALTER TABLE vitrines ENABLE ROW LEVEL SECURITY;

-- Dona pode tudo na sua vitrine
CREATE POLICY "vitrines_owner_all" ON vitrines
  FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Público pode ler vitrines ativas
CREATE POLICY "vitrines_public_read" ON vitrines
  FOR SELECT USING (is_active = TRUE);
```

### 4.3 `products`

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Dona da vitrine gerencia seus produtos
CREATE POLICY "products_owner_all" ON products
  FOR ALL USING (
    vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = auth.uid())
  ) WITH CHECK (
    vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = auth.uid())
  );

-- Público lê produtos ativos de vitrines ativas
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (
    is_active = TRUE
    AND vitrine_id IN (SELECT id FROM vitrines WHERE is_active = TRUE)
  );
```

### 4.4 `order_intents`

```sql
ALTER TABLE order_intents ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode INSERT (clique público)
CREATE POLICY "intents_public_insert" ON order_intents
  FOR INSERT WITH CHECK (TRUE);

-- Só a dona da vitrine vê seus intents
CREATE POLICY "intents_owner_read" ON order_intents
  FOR SELECT USING (
    vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = auth.uid())
  );
```

### 4.5 `subscriptions` e `invoices`

```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = owner_id);

-- Updates só via service role (webhook do Asaas) — sem policy de UPDATE para usuário
```

### 4.6 Implementação (#0004)

As políticas acima são **exemplos das principais**. O conjunto completo e autoritativo está em `supabase/migrations/20260601152521_rls_policies.sql`, cobrindo as 14 tabelas. Convenções aplicadas:

- `(select auth.uid())` (subselect) em vez de `auth.uid()` direto — o planner avalia uma vez por query (recomendação Supabase).
- `TO anon` / `TO authenticated` explícitos em cada política.
- **A leitura pública é da vitrine inteira**: qualquer um (anônimo ou logado) lê itens **ativos** de **qualquer** vitrine ativa; o isolamento por dona vale para **escrita** (insert/update/delete) e para os dados privados (`order_intents`, `subscriptions`, `invoices`, `profiles`).
- `coupons` e `audit_logs` ficam **sem política** (acesso só via `service_role`, que tem BYPASSRLS); `suggested_brands` tem leitura pública (dado de referência).
- Verificação: testes em `tests/rls/` (`pnpm test:rls`) e job `rls` no CI.

## 5. Estratégia de migração

### 5.1 Versionamento

Migrações ficam em `supabase/migrations/` com nomenclatura `YYYYMMDDHHMMSS_descricao.sql`. Aplicação via `supabase db push` em desenvolvimento e via CI em staging/produção.

### 5.2 Migrations sugeridas para o MVP

```
20260601114606_initial_schema.sql         # Tabelas, enums, índices (incl. GIN full-text), triggers e cupons
20260601114607_seed_suggested_brands.sql  # Seed de marcas comuns (dado de referência)
# RLS entra em migration separada na #0004 (rls_policies.sql)
```

Os índices full-text (`GIN`) e os parciais já entram na própria `initial_schema.sql`, não em migration separada.

### 5.3 Princípios

- Migrações são append-only (nunca editar uma já aplicada em produção)
- Cada migração deve ser idempotente quando possível (`CREATE TABLE IF NOT EXISTS`, `ON CONFLICT`, etc.)
- Mudanças destrutivas (DROP, RENAME) entram em duas etapas: adiciona o novo, migra dado, remove o antigo em deploy posterior
- Toda migração testada primeiro em staging com snapshot recente de produção

## 6. Seed de desenvolvimento

`supabase/seed.sql` cria dados realistas para desenvolvimento:

- 3 usuárias-exemplo (Mariana, Carla, Joana — espelhando as personas), com login de dev (senha `vitrinio123`)
- 1 vitrine ativa por usuária com marcas, categorias, produtos e imagens
- Produtos: Mariana (Pro) tem 13; Carla e Joana (Free) têm 5 cada — o limite de 5 do plano Free é imposto pelo trigger `check_product_limit`
- 30 dias simulados de `order_intents` distribuídos (volumes distintos por persona)
- 1 assinatura Pro ativa (Mariana)

## 7. Backup e retenção

- Backup nativo Supabase: diário, retenção de 7 ou 30 dias dependendo do plano
- Backup adicional: dump semanal exportado para storage externo (Wasabi/S3) com retenção de 90 dias
- Dados de usuária excluída (LGPD): anonimização em 30 dias, conforme política em [LEGAL.md](./LEGAL.md)

## 8. Performance e otimizações futuras

À medida que escala, considerar:

- ~~Materialized view para `vitrine_stats` (views, intents agregados por dia)~~ — implementado em #0016 como a tabela rollup `vitrine_daily_stats` (§2.14), mantida incrementalmente por RPC/trigger
- Particionamento de `order_intents` por mês quando passar de 10M registros
- Read replica para queries de analytics
- Cache de vitrine renderizada em Redis para slugs muito acessados
