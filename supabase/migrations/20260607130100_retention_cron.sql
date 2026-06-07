-- Migration: agendamento diário da retenção via pg_cron — #0021 (PR2)
-- Referência: docs/LEGAL.md §1.5. O pg_cron dispara (via pg_net) a rota Next
-- protegida POST /api/cron/retention, que apaga audit_logs >180d e anula o ip_hash
-- de order_intents >12 meses — a lógica/janelas ficam em TS (lib/retention), não em SQL.
--
-- Mesmo padrão secretless do billing (20260604122100): URL e segredo vêm de GUCs
-- setadas só no remoto pelo operador; o bloco é GUARDADO para não quebrar db push/CI.
--
-- Configurar no remoto (uma vez), no SQL editor:
--   ALTER DATABASE postgres SET app.cron_retention_url = 'https://vitrinio.com.br/api/cron/retention';
--   -- reaproveita app.cron_secret já configurado para o billing.

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  PERFORM cron.unschedule('vitrinio-retention-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vitrinio-retention-daily');

  -- 09:30 UTC (06:30 BRT): meia hora depois do billing, p/ não concorrerem.
  PERFORM cron.schedule(
    'vitrinio-retention-daily',
    '30 9 * * *',
    $cron$
      SELECT net.http_post(
        url := current_setting('app.cron_retention_url', true),
        headers := jsonb_build_object(
          'content-type', 'application/json',
          'x-cron-secret', current_setting('app.cron_secret', true)
        ),
        body := '{}'::jsonb
      );
    $cron$
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron/pg_net indisponível ou GUC ausente; agendamento ignorado neste ambiente (%).', SQLERRM;
END
$$;
