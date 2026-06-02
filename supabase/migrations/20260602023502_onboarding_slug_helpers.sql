-- Migration: helper de disponibilidade de slug — #0008
-- Referência: docs/DATABASE.md §2.2 e docs/ARCHITECTURE.md §6.5.
--
-- A RLS de `vitrines` (vitrines_public_read) só expõe vitrines ATIVAS, então um
-- SELECT comum não enxerga slugs já tomados por vitrines INATIVAS de terceiros
-- (toda vitrine nasce inativa com slug provisório). Para o check de
-- disponibilidade no onboarding ser confiável, usamos uma função SECURITY
-- DEFINER que enxerga todas as linhas. A unicidade real continua garantida pelo
-- índice único idx_vitrines_slug.

CREATE OR REPLACE FUNCTION is_slug_available(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.vitrines WHERE slug = p_slug
  );
$$;

REVOKE EXECUTE ON FUNCTION is_slug_available(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_slug_available(TEXT) TO authenticated;
