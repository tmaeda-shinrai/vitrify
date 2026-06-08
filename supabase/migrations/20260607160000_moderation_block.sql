-- Migration: bloqueio de moderação (vitrine + conta) — #0023 (PR2)
-- Referência: issues/0023-administracao-interna-e-moderacao.md, docs/LEGAL.md §2.2/§4.2.
--
-- O admin (service role) pode bloquear/reativar uma vitrine (tira do ar) e/ou uma
-- conta (suspende o login). O bloqueio é À PROVA DA DONA: um trigger BEFORE UPDATE
-- impede qualquer papel que NÃO seja `service_role` de alterar blocked_at/reason —
-- assim a dona não se desbloqueia editando a própria vitrine/perfil.

ALTER TABLE vitrines ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE vitrines ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_reason TEXT;

-- Esconde vitrine bloqueada do público (anon/authenticated). A página pública mostra
-- uma mensagem neutra (checagem via service role no caminho not-found).
DROP POLICY IF EXISTS "vitrines_public_read" ON vitrines;
CREATE POLICY "vitrines_public_read" ON vitrines
  FOR SELECT TO anon, authenticated
  USING (is_active = true AND blocked_at IS NULL);

-- Guarda do bloqueio: só `service_role` (admin) muda blocked_at/blocked_reason.
-- SECURITY INVOKER (padrão) para que current_user reflita o papel da requisição
-- (PostgREST faz SET ROLE: anon/authenticated/service_role).
CREATE OR REPLACE FUNCTION protect_block_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF current_user <> 'service_role' THEN
    NEW.blocked_at := OLD.blocked_at;
    NEW.blocked_reason := OLD.blocked_reason;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_vitrine_block
  BEFORE UPDATE ON vitrines
  FOR EACH ROW EXECUTE FUNCTION protect_block_fields();

CREATE TRIGGER protect_profile_block
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_block_fields();
