-- Migration: contagem de visualizações da vitrine — #0015 (PR2)
-- Referência: docs/DATABASE.md §2.2.
--
-- A vitrine pública é estática/ISR e o cliente anônimo não pode dar UPDATE em
-- vitrines (RLS). Esta função SECURITY DEFINER incrementa views_count de uma
-- vitrine ATIVA pelo slug; é chamada pelo endpoint público /api/view (com dedup
-- por sessão no client e por IP no server). Espelha o is_slug_available, mas
-- executável por anon.

CREATE OR REPLACE FUNCTION increment_vitrine_views(p_slug TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.vitrines
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE slug = p_slug AND is_active = true;
$$;

REVOKE EXECUTE ON FUNCTION increment_vitrine_views(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_vitrine_views(TEXT) TO anon, authenticated;
