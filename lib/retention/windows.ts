/**
 * Janelas de retenção de dados (#0021) conforme `docs/LEGAL.md` §1.5. Lógica pura,
 * testável; as deleções/anonimizações em si ficam na rota `app/api/cron/retention`.
 */

/** Logs de auditoria: 180 dias (legítimo interesse / Marco Civil). */
export const AUDIT_LOG_RETENTION_DAYS = 180;

/** Hash de IP em intenções de pedido: 12 meses (analytics agregada). */
export const ORDER_INTENT_IP_RETENTION_MONTHS = 12;

/** ISO da data-limite N dias antes de `now` (registros mais antigos expiram). */
export function cutoffDaysAgo(now: Date, days: number): string {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return cutoff.toISOString();
}

/** ISO da data-limite N meses antes de `now`. */
export function cutoffMonthsAgo(now: Date, months: number): string {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
  return cutoff.toISOString();
}
