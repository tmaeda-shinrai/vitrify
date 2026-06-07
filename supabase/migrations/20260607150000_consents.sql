-- Migration: consentimento opcional de marketing — #0021 (PR4)
-- Referência: issues/0021-conformidade-legal-lgpd.md, docs/LEGAL.md §1.4 (revogação
-- de consentimento). Default TRUE reflete o estado atual (o nudge de indicação já é
-- enviado); a usuária pode revogar em Configurações > Privacidade.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT TRUE;
