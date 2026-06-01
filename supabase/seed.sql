-- ============================================================================
-- Seed de DESENVOLVIMENTO (docs/DATABASE.md §6)
-- Roda automaticamente no `supabase db reset` (db.seed em config.toml).
-- NÃO use em produção.
--
-- Cria 3 personas (SPEC.md §4): Mariana (Pro), Carla (Free) e Joana (Free),
-- cada uma com 1 vitrine ativa, marcas/categorias, produtos, imagens e ~30
-- dias de order_intents distribuídos.
--
-- Login de desenvolvimento (após a #0005): e-mails abaixo, senha "vitrinio123".
--   mariana@vitrinio.dev / carla@vitrinio.dev / joana@vitrinio.dev
--
-- Obs.: contas Free respeitam o limite de 5 produtos (trigger check_product_limit),
-- por isso Carla/Joana têm 5 produtos e Mariana (Pro) tem 13.
-- ============================================================================

-- Helper: cria usuária em auth.users (+ identity de e-mail) e dispara o trigger
-- handle_new_user, que cria profile + subscription(free/active) + vitrine inativa.
CREATE OR REPLACE FUNCTION public._seed_create_user(
  p_id UUID, p_email TEXT, p_name TEXT, p_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = extensions, public, auth, pg_catalog
AS $$
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', p_id, 'authenticated', 'authenticated',
    p_email, crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', p_name),
    now(), now(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_id::text, p_id,
    jsonb_build_object('sub', p_id::text, 'email', p_email), 'email',
    now(), now(), now()
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- PERSONA 1 — Mariana (Pro, multimarcas: Avon + Natura + Hinode), 13 produtos
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_uid  UUID := '11111111-1111-1111-1111-111111111111';
  v_vit  UUID;
  b_avon UUID; b_natura UUID; b_hinode UUID;
  c_perf UUID; c_maq UUID; c_pele UUID; c_corpo UUID;
BEGIN
  PERFORM public._seed_create_user(v_uid, 'mariana@vitrinio.dev', 'Mariana Souza', 'vitrinio123');

  -- Upgrade para Pro ANTES de inserir produtos: senão o trigger check_product_limit
  -- (que vê plano free) barraria o 6º produto. Mariana é a conta Pro ativa do seed.
  UPDATE public.subscriptions
     SET plan = 'pro',
         status = 'active',
         asaas_customer_id = 'cus_seed_mariana',
         asaas_subscription_id = 'sub_seed_mariana',
         current_period_start = now() - interval '10 days',
         current_period_end = now() + interval '20 days'
   WHERE owner_id = v_uid;

  UPDATE public.profiles
     SET whatsapp = '5567996541230',
         bio = 'Revendedora multimarcas há 6 anos. Avon, Natura e Hinode com entrega rápida 💜',
         onboarding_completed_at = now() - interval '120 days'
   WHERE id = v_uid;

  SELECT id INTO v_vit FROM public.vitrines WHERE owner_id = v_uid;
  UPDATE public.vitrines
     SET slug = 'mariana-cosmeticos',
         title = 'Mariana Cosméticos',
         subtitle = 'Avon • Natura • Hinode — peça pelo WhatsApp',
         theme_primary = '#7C3AED',
         is_active = TRUE,
         views_count = 1280
   WHERE id = v_vit;

  INSERT INTO public.brands (vitrine_id, name) VALUES (v_vit, 'Avon')   RETURNING id INTO b_avon;
  INSERT INTO public.brands (vitrine_id, name) VALUES (v_vit, 'Natura') RETURNING id INTO b_natura;
  INSERT INTO public.brands (vitrine_id, name) VALUES (v_vit, 'Hinode') RETURNING id INTO b_hinode;

  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Perfumaria', 1)            RETURNING id INTO c_perf;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Maquiagem', 2)             RETURNING id INTO c_maq;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Cuidados com a Pele', 3)   RETURNING id INTO c_pele;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Corpo & Banho', 4)         RETURNING id INTO c_corpo;

  INSERT INTO public.products (vitrine_id, brand_id, category_id, name, description, price_cents, promo_price_cents, display_order) VALUES
    (v_vit, b_avon,   c_perf,  'Avon Eve Truth Eau de Parfum 50ml',          'Perfume floral amadeirado, fixação prolongada.',        12990, 9990,  1),
    (v_vit, b_avon,   c_maq,   'Batom Avon Ultramatte Vermelho Absoluto',    'Acabamento matte aveludado, longa duração.',            2990,  NULL,  2),
    (v_vit, b_avon,   c_pele,  'Avon Renew Sérum Anti-idade',                'Sérum com ácido hialurônico para firmeza da pele.',     8990,  7490,  3),
    (v_vit, b_avon,   c_corpo, 'Hidratante Avon Cuide-se Bem Beijinho 400ml','Hidratante corporal com fragrância de beijinho.',       2490,  NULL,  4),
    (v_vit, b_natura, c_perf,  'Natura Kaiak Masculino 100ml',               'Clássico amadeirado aquático masculino.',               13990, NULL,  5),
    (v_vit, b_natura, c_perf,  'Natura Essencial Feminino 100ml',            'Deo parfum sofisticado para o dia a dia e a noite.',    18990, 15990, 6),
    (v_vit, b_natura, c_maq,   'Base Natura Una Cobertura Natural',          'Base líquida de cobertura natural, 12 tons.',           6990,  NULL,  7),
    (v_vit, b_natura, c_pele,  'Natura Chronos Hidratante Facial 70+',       'Hidratante antissinais para pele madura.',              9990,  NULL,  8),
    (v_vit, b_natura, c_corpo, 'Natura Tododia Hidratante Algodão 400ml',    'Hidratante corporal de rápida absorção.',               3990,  NULL,  9),
    (v_vit, b_hinode, c_perf,  'Hinode Empire Masculino 100ml',              'Fragrância marcante amadeirada e especiada.',           16990, 13990, 10),
    (v_vit, b_hinode, c_perf,  'Hinode Hortência Deo Colônia 100ml',         'Floral delicado, perfeito para o dia.',                 10990, NULL,  11),
    (v_vit, b_hinode, c_maq,   'Máscara de Cílios Hinode Volume Total',      'Volume e alongamento sem borrar.',                      4590,  NULL,  12),
    (v_vit, b_hinode, c_pele,  'Hinode Hand Cream Reparador 75g',            'Creme reparador para mãos ressecadas.',                 2990,  NULL,  13);

  -- 1 imagem por produto (placeholder público para dev)
  INSERT INTO public.product_images (product_id, url, alt_text, display_order)
  SELECT p.id, 'https://picsum.photos/seed/' || p.id || '/600/600', p.name, 0
  FROM public.products p WHERE p.vitrine_id = v_vit;

  -- ~140 intenções nos últimos 30 dias
  INSERT INTO public.order_intents (vitrine_id, product_id, source, user_agent_short, ip_hash, created_at)
  SELECT v_vit,
         (SELECT id FROM public.products WHERE vitrine_id = v_vit ORDER BY random() LIMIT 1),
         (ARRAY['instagram','whatsapp','direct','instagram','direct'])[(1 + floor(random()*5))::int],
         (ARRAY['mobile-android','mobile-ios','desktop'])[(1 + floor(random()*3))::int],
         md5(random()::text || clock_timestamp()::text),
         now() - (random() * interval '30 days')
  FROM generate_series(1, 140);
END $$;

-- ----------------------------------------------------------------------------
-- PERSONA 2 — Carla (Free, consultora Natura iniciante), 5 produtos
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_uid UUID := '22222222-2222-2222-2222-222222222222';
  v_vit UUID;
  b_natura UUID;
  c_perf UUID; c_maq UUID; c_pele UUID;
BEGIN
  PERFORM public._seed_create_user(v_uid, 'carla@vitrinio.dev', 'Carla Lima', 'vitrinio123');

  UPDATE public.profiles
     SET whatsapp = '5511998877665',
         bio = 'Consultora Natura 🌿 Começando agora e atendendo com muito carinho!',
         onboarding_completed_at = now() - interval '18 days'
   WHERE id = v_uid;

  SELECT id INTO v_vit FROM public.vitrines WHERE owner_id = v_uid;
  UPDATE public.vitrines
     SET slug = 'carla-natura',
         title = 'Espaço Natura da Carla',
         subtitle = 'Consultora Natura — novidades toda semana',
         theme_primary = '#16A34A',
         is_active = TRUE,
         views_count = 92
   WHERE id = v_vit;

  INSERT INTO public.brands (vitrine_id, name) VALUES (v_vit, 'Natura') RETURNING id INTO b_natura;

  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Perfumaria', 1)          RETURNING id INTO c_perf;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Maquiagem', 2)           RETURNING id INTO c_maq;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Cuidados com a Pele', 3) RETURNING id INTO c_pele;

  INSERT INTO public.products (vitrine_id, brand_id, category_id, name, description, price_cents, promo_price_cents, display_order) VALUES
    (v_vit, b_natura, c_perf, 'Natura Ilía Deo Parfum 50ml',                'Fragrância floral marcante e feminina.',           17990, 14990, 1),
    (v_vit, b_natura, c_maq,  'Batom Natura Una Matte Rosa Nude',           'Cor versátil para o dia a dia, acabamento matte.', 4490,  NULL,  2),
    (v_vit, b_natura, c_maq,  'Paleta de Sombras Natura Aquarela',          '12 cores para looks do natural ao marcante.',      5990,  NULL,  3),
    (v_vit, b_natura, c_perf, 'Natura Luna Feminino 75ml',                  'Floral adocicado, jovem e envolvente.',            12990, NULL,  4),
    (v_vit, b_natura, c_pele, 'Natura Chronos Gel Creme Antissinais',       'Hidratação leve com ação antissinais.',            8990,  7990,  5);

  INSERT INTO public.product_images (product_id, url, alt_text, display_order)
  SELECT p.id, 'https://picsum.photos/seed/' || p.id || '/600/600', p.name, 0
  FROM public.products p WHERE p.vitrine_id = v_vit;

  -- ~18 intenções nos últimos 30 dias (iniciante)
  INSERT INTO public.order_intents (vitrine_id, product_id, source, user_agent_short, ip_hash, created_at)
  SELECT v_vit,
         (SELECT id FROM public.products WHERE vitrine_id = v_vit ORDER BY random() LIMIT 1),
         (ARRAY['instagram','tiktok','direct'])[(1 + floor(random()*3))::int],
         (ARRAY['mobile-android','mobile-ios','desktop'])[(1 + floor(random()*3))::int],
         md5(random()::text || clock_timestamp()::text),
         now() - (random() * interval '30 days')
  FROM generate_series(1, 18);
END $$;

-- ----------------------------------------------------------------------------
-- PERSONA 3 — Joana (Free, veterana Avon), 5 produtos
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_uid UUID := '33333333-3333-3333-3333-333333333333';
  v_vit UUID;
  b_avon UUID;
  c_perf UUID; c_maq UUID; c_corpo UUID;
BEGIN
  PERFORM public._seed_create_user(v_uid, 'joana@vitrinio.dev', 'Joana Pereira', 'vitrinio123');

  UPDATE public.profiles
     SET whatsapp = '5521987654321',
         bio = 'Revendedora Avon há mais de 20 anos. Atendimento de confiança ❤️',
         onboarding_completed_at = now() - interval '60 days'
   WHERE id = v_uid;

  SELECT id INTO v_vit FROM public.vitrines WHERE owner_id = v_uid;
  UPDATE public.vitrines
     SET slug = 'joana-avon',
         title = 'Avon com a Joana',
         subtitle = 'Mais de 20 anos cuidando das minhas clientes',
         theme_primary = '#DB2777',
         is_active = TRUE,
         views_count = 640
   WHERE id = v_vit;

  INSERT INTO public.brands (vitrine_id, name) VALUES (v_vit, 'Avon') RETURNING id INTO b_avon;

  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Perfumaria', 1)    RETURNING id INTO c_perf;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Maquiagem', 2)     RETURNING id INTO c_maq;
  INSERT INTO public.categories (vitrine_id, name, display_order) VALUES (v_vit, 'Corpo & Banho', 3) RETURNING id INTO c_corpo;

  INSERT INTO public.products (vitrine_id, brand_id, category_id, name, description, price_cents, promo_price_cents, display_order) VALUES
    (v_vit, b_avon, c_perf,  'Avon Far Away Eau de Parfum 50ml',        'Oriental floral, um clássico atemporal.',          9990,  7990, 1),
    (v_vit, b_avon, c_maq,   'Batom Avon Power Stay 16h Vermelho',      'Cor intensa que dura o dia todo.',                 3490,  NULL, 2),
    (v_vit, b_avon, c_corpo, 'Avon Senses Sabonete Líquido 1L',         'Sabonete líquido cremoso, refil econômico.',       1990,  NULL, 3),
    (v_vit, b_avon, c_perf,  'Avon Encanto Sedução Deo Colônia 100ml',  'Fragrância envolvente para a noite.',              8490,  NULL, 4),
    (v_vit, b_avon, c_corpo, 'Desodorante Avon On Duty Roll-on',        'Proteção 48h, sem manchar a roupa.',               1290,  NULL, 5);

  INSERT INTO public.product_images (product_id, url, alt_text, display_order)
  SELECT p.id, 'https://picsum.photos/seed/' || p.id || '/600/600', p.name, 0
  FROM public.products p WHERE p.vitrine_id = v_vit;

  -- ~70 intenções nos últimos 30 dias (clientela fiel)
  INSERT INTO public.order_intents (vitrine_id, product_id, source, user_agent_short, ip_hash, created_at)
  SELECT v_vit,
         (SELECT id FROM public.products WHERE vitrine_id = v_vit ORDER BY random() LIMIT 1),
         (ARRAY['whatsapp','direct','whatsapp','instagram'])[(1 + floor(random()*4))::int],
         (ARRAY['mobile-android','mobile-ios','desktop'])[(1 + floor(random()*3))::int],
         md5(random()::text || clock_timestamp()::text),
         now() - (random() * interval '30 days')
  FROM generate_series(1, 70);
END $$;

-- Sincroniza o contador denormalizado de intenções por produto (realismo no painel)
UPDATE public.products p
   SET intents_count = sub.c
  FROM (
    SELECT product_id, count(*) AS c
    FROM public.order_intents
    WHERE product_id IS NOT NULL
    GROUP BY product_id
  ) sub
 WHERE p.id = sub.product_id;

DROP FUNCTION public._seed_create_user(UUID, TEXT, TEXT, TEXT);
