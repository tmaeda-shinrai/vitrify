-- Migration: seed dos cupons do MVP — #0019 (PR4)
-- Referência: docs/PRICING.md §5.2. Idempotente (ON CONFLICT por code).
-- PRIMEIRA50: 50% na 1ª cobrança (aplicado só na primeira no checkout).
-- ANUAL30: 30% (intenção: plano anual; sem coluna de período, vale na 1ª cobrança).
-- INDICACAO: 1 mês grátis (free_days = 30) — base do programa de indicação (#0020).

INSERT INTO coupons (code, description, discount_type, discount_value, applies_to_plan, max_redemptions, is_active)
VALUES
  ('PRIMEIRA50', '50% de desconto na primeira mensalidade', 'percent', 50, NULL, 500, TRUE),
  ('ANUAL30', '30% de desconto no plano anual', 'percent', 30, NULL, NULL, TRUE),
  ('INDICACAO', '1 mês grátis (programa de indicação)', 'free_days', 30, NULL, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;
