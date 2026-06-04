-- Migration: agendamento diário do billing via pg_cron — #0019 (PR5)
-- Referência: docs/PRICING.md §6.3. O pg_cron dispara (via pg_net) a rota Next
-- protegida POST /api/cron/billing, que faz as transições por tempo e (PR6) os
-- e-mails de inadimplência — assim a lógica/templating fica em TS, não em SQL.
--
-- Secretless e seguro em qualquer ambiente: a URL e o segredo vêm de GUCs setadas só
-- no remoto pelo operador; o bloco é GUARDADO para não quebrar `db push`/CI onde o
-- pg_cron não está pré-carregado (shared_preload_libraries).
--
-- Configurar no remoto (uma vez), no SQL editor:
--   ALTER DATABASE postgres SET app.cron_url    = 'https://vitrinio.com.br/api/cron/billing';
--   ALTER DATABASE postgres SET app.cron_secret = '<CRON_SECRET (mesmo do app)>';

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Remove agendamento anterior (idempotência) e reagenda 1x/dia às 09:00 UTC (06:00 BRT).
  PERFORM cron.unschedule('vitrinio-billing-daily')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vitrinio-billing-daily');

  PERFORM cron.schedule(
    'vitrinio-billing-daily',
    '0 9 * * *',
    $cron$
      SELECT net.http_post(
        url := current_setting('app.cron_url', true),
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
