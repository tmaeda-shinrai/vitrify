-- Migration: agendamento do health check via pg_cron — #0024 (ARCHITECTURE §8.4).
-- O pg_cron dispara (via pg_net) a rota POST /api/cron/health, que roda o health
-- check (DB/Storage) e alerta os admins por e-mail se algo estiver "down". A lógica
-- fica em TS (app/api/cron/health + lib/alerts), não em SQL.
--
-- Mesmo padrão secretless do billing/retention: URL e segredo vêm de GUCs setadas
-- só no remoto pelo operador; o bloco é GUARDADO para não quebrar db push/CI.
--
-- Configurar no remoto (uma vez), no SQL editor:
--   ALTER DATABASE postgres SET app.cron_health_url = 'https://vitrinio.com.br/api/cron/health';
--   -- reaproveita app.cron_secret já configurado para o billing.

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  PERFORM cron.unschedule('vitrinio-health-15min')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vitrinio-health-15min');

  -- A cada 15 minutos.
  PERFORM cron.schedule(
    'vitrinio-health-15min',
    '*/15 * * * *',
    $cron$
      SELECT net.http_post(
        url := current_setting('app.cron_health_url', true),
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
