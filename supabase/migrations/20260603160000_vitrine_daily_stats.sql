-- Migration: agregados diários da vitrine (views/cliques por dia) — #0016
-- Referência: docs/DATABASE.md §2.8 e §8 (o "vitrine_stats agregado por dia").
--
-- A #0015 só guardava o contador total (vitrines.views_count) e o por produto
-- (products.intents_count), sem série por data. Esta tabela rollup alimenta as
-- janelas de 7/30 dias e o gráfico temporal do painel de Estatísticas, sem
-- guardar PII por evento. A escrita é só via funções SECURITY DEFINER (o cliente
-- anônimo registra views/intents, mas não pode dar UPDATE direto na tabela).
-- Data do bucket em America/Sao_Paulo para alinhar com o dia local da vendedora.

CREATE TABLE IF NOT EXISTS vitrine_daily_stats (
  vitrine_id    UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  stat_date     DATE NOT NULL,
  views_count   INTEGER NOT NULL DEFAULT 0,
  intents_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (vitrine_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_vitrine_date
  ON vitrine_daily_stats(vitrine_id, stat_date DESC);

ALTER TABLE vitrine_daily_stats ENABLE ROW LEVEL SECURITY;

-- A dona lê os agregados das próprias vitrines (espelha order_intents_owner_read).
-- Sem policy de INSERT/UPDATE: só as funções SECURITY DEFINER abaixo escrevem.
CREATE POLICY "daily_stats_owner_read" ON vitrine_daily_stats
  FOR SELECT TO authenticated
  USING (vitrine_id IN (SELECT id FROM vitrines WHERE owner_id = (select auth.uid())));

-- VIEWS: estende o RPC já chamado pelo /api/view (assinatura inalterada). Além de
-- somar no contador total, faz upsert da contagem do dia. Substitui a versão sql
-- da migration 20260603150000 por plpgsql (CREATE OR REPLACE, sem editar a antiga).
CREATE OR REPLACE FUNCTION increment_vitrine_views(p_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
  v_day DATE := (timezone('America/Sao_Paulo', now()))::date;
BEGIN
  UPDATE public.vitrines
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE slug = p_slug AND is_active = true
  RETURNING id INTO v_id;

  IF v_id IS NOT NULL THEN
    INSERT INTO public.vitrine_daily_stats (vitrine_id, stat_date, views_count)
    VALUES (v_id, v_day, 1)
    ON CONFLICT (vitrine_id, stat_date)
    DO UPDATE SET views_count = vitrine_daily_stats.views_count + 1;
  END IF;
END;
$$;

-- CLIQUES: trigger AFTER INSERT em order_intents → upsert dos cliques do dia.
-- Conta TODOS os intents (inclusive o FAB geral, com product_id nulo), diferente
-- do bump_product_intents (que é por produto). O dedup curto do /api/intent
-- (Upstash) evita inflar, pois recliques nem chegam a inserir a linha.
CREATE OR REPLACE FUNCTION bump_vitrine_daily_intents()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_day DATE := (timezone('America/Sao_Paulo', now()))::date;
BEGIN
  INSERT INTO public.vitrine_daily_stats (vitrine_id, stat_date, intents_count)
  VALUES (NEW.vitrine_id, v_day, 1)
  ON CONFLICT (vitrine_id, stat_date)
  DO UPDATE SET intents_count = vitrine_daily_stats.intents_count + 1;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_vitrine_daily_intents ON order_intents;
CREATE TRIGGER trg_bump_vitrine_daily_intents
  AFTER INSERT ON order_intents
  FOR EACH ROW EXECUTE FUNCTION bump_vitrine_daily_intents();
