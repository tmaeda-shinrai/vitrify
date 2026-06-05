/**
 * Helpers puros de data para o gateway (formato `YYYY-MM-DD` exigido pelo Asaas,
 * fuso America/Sao_Paulo). Usados pelo cupom de dias grátis (#0019) e pelo defer
 * de 1 mês da recompensa de indicação (#0020).
 */

const SAO_PAULO_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Data (BRT) em `YYYY-MM-DD` deslocada por `days` a partir de hoje. */
export function dueDateInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return SAO_PAULO_DATE.format(d);
}

/**
 * Soma `days` a uma data `YYYY-MM-DD`, devolvendo `YYYY-MM-DD`. Ancora ao meio-dia
 * BRT para a soma não escorregar de dia ao converter o fuso, independente do TZ do runtime.
 */
export function addDaysToDate(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00-03:00`);
  if (Number.isNaN(d.getTime())) return date;
  d.setDate(d.getDate() + days);
  return SAO_PAULO_DATE.format(d);
}
