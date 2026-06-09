-- Migration: programa de embaixadoras (Plus vitalício + selo) — #0025 (M7, PR1)
-- Referência: issues/0025-beta-fechado-e-lancamento.md, docs/GTM.md §2.1, docs/LEGAL.md §9.
--
-- Embaixadoras pioneiras recebem Plus gratuito vitalício (concedido pelo admin via
-- service role; a assinatura vira plan='plus' sem fim de período) + um selo
-- "Embaixadora Pioneira" na vitrine pública. O status é À PROVA DA DONA: um trigger
-- BEFORE UPDATE impede qualquer papel que NÃO seja `service_role` de alterar
-- is_ambassador/ambassador_since — assim a dona não se autoconcede o selo editando
-- o próprio perfil (a policy `profiles_update_own` permite UPDATE da própria linha).

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_ambassador BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ambassador_since TIMESTAMPTZ;

-- Guarda do selo: só `service_role` (admin) muda is_ambassador/ambassador_since.
-- SECURITY INVOKER (padrão) para que current_user reflita o papel da requisição
-- (PostgREST faz SET ROLE: anon/authenticated/service_role). Espelha
-- protect_block_fields (20260607160000_moderation_block.sql); função separada porque
-- aquela é compartilhada com `vitrines`, que não tem estas colunas.
CREATE OR REPLACE FUNCTION protect_ambassador_field()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF current_user <> 'service_role' THEN
    NEW.is_ambassador := OLD.is_ambassador;
    NEW.ambassador_since := OLD.ambassador_since;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_ambassador ON profiles;
CREATE TRIGGER protect_profile_ambassador
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_ambassador_field();
