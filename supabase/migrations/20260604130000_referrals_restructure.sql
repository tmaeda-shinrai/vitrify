-- Migration: reestrutura referrals + código de indicação por-usuária — #0020 (PR1)
-- Referência: docs/DATABASE.md §2.11 (referrals), issues/0020-programa-de-indicacao.md.
--
-- A referrals original (#0003) carregava `code UNIQUE NOT NULL` na MESMA linha que
-- `referred_id`/`converted_at`/`reward_granted`. Isso é incompatível: um referrer
-- tem UM código mas indica VÁRIAS pessoas — o UNIQUE por linha impede repetir o
-- código em cada linha de indicada. Solução: o código por-usuária passa a morar em
-- profiles.referral_code (gerado sob demanda, ver ensure_referral_code); referrals
-- vira puramente por-evento (uma linha por indicada), com `code` agora uma cópia
-- denormalizada opcional do código usado na captura. A tabela ainda é greenfield
-- (sem linhas; a lógica só chega na #0020), então o ALTER destrutivo é seguro em
-- passo único.

-- Código de indicação por-usuária (opaco, gerado sob demanda).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles(referral_code) WHERE referral_code IS NOT NULL;

-- Marcador de idempotência do e-mail-nudge "indique uma amiga" (#0020 PR3).
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_nudge_sent_at TIMESTAMPTZ;

-- referrals vira por-evento: solta o UNIQUE/NOT NULL do code (vira cópia denormalizada).
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_code_key;
ALTER TABLE referrals ALTER COLUMN code DROP NOT NULL;

-- Índices p/ o painel (lista do referrer) e o lookup de conversão (#0020 PR2/PR3).
-- referred_id já é UNIQUE (serve de índice do lookup de conversão e de idempotência).
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_converted_at ON referrals(converted_at);
