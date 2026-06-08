-- Migration: denúncias de vitrine (DMCA-like) — #0023 (PR3)
-- Referência: issues/0023-administracao-interna-e-moderacao.md, docs/LEGAL.md §2.2/§3.1.
--
-- Registra denúncias do botão "Denunciar" da vitrine pública. A inserção é feita
-- pela rota POST /api/report (service role); a gestão é no /admin. RLS habilitada
-- SEM policy → acesso só por service role (nem a denunciante nem a dona leem).

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vitrine_id UUID NOT NULL REFERENCES vitrines(id) ON DELETE CASCADE,
  reporter_email VARCHAR(255),
  reason VARCHAR(40) NOT NULL,          -- 'copyright' | 'prohibited' | 'spam' | 'other'
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open',  -- open | investigating | resolved | dismissed
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_vitrine ON reports(vitrine_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
