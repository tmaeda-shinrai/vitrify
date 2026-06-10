-- Migration: agendamento da emissão de NF-e via pg_cron — #0025 (docs/PRICING.md §7).
-- O pg_cron dispara (via pg_net) a rota POST /api/cron/nfe, que emite a NFS-e das
-- faturas pagas ainda sem nota (SLA ≤ 24h; rodar de hora em hora dá folga + retries).
-- A lógica fica em TS (app/api/cron/nfe + lib/fiscal), não em SQL.
--
-- Mesmo padrão secretless do billing/retention/health: URL e segredo vêm de GUCs
-- setadas só no remoto pelo operador; o bloco é GUARDADO para não quebrar db push/CI.
--
-- Configurar no remoto (uma vez), no SQL editor:
--   ALTER DATABASE postgres SET app.cron_nfe_url = 'https://vitrinio.com.br/api/cron/nfe';
--   -- reaproveita app.cron_secret já configurado para o billing.

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_net;
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  PERFORM cron.unschedule('vitrinio-nfe-hourly')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vitrinio-nfe-hourly');

  -- De hora em hora (minuto 0).
  PERFORM cron.schedule(
    'vitrinio-nfe-hourly',
    '0 * * * *',
    $cron$
      SELECT net.http_post(
        url := current_setting('app.cron_nfe_url', true),
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
