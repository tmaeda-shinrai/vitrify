/**
 * Helpers puros do painel de Estatísticas (#0016), sem dependência de servidor —
 * testáveis isoladamente, no estilo de lib/intents.ts. As agregações trabalham
 * sobre chaves de data `YYYY-MM-DD` (os buckets diários de vitrine_daily_stats,
 * gravados no fuso America/Sao_Paulo).
 */

/** Uma linha do rollup diário, já no formato de apresentação. */
export interface DailyStatRow {
  /** Dia `YYYY-MM-DD`. */
  date: string;
  views: number;
  intents: number;
}

export interface StatsSummary {
  viewsTotal: number;
  views7d: number;
  views30d: number;
  intents7d: number;
  intents30d: number;
}

export interface TopProductRow {
  id: string;
  name: string;
  intents: number;
}

export interface SourceCount {
  source: string;
  count: number;
}

/** Soma `delta` dias a uma chave `YYYY-MM-DD` (math em UTC para não derrapar no fuso). */
function addDaysKey(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/** Dia atual `YYYY-MM-DD` no fuso da vendedora (BRT), p/ alinhar com os buckets. */
export function dateKeyInSaoPaulo(now: Date = new Date()): string {
  // en-CA formata como `YYYY-MM-DD`; timeZone garante o dia local.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now);
}

/** Chave `YYYY-MM-DD` de `days` dias atrás — usada para filtrar a query (`stat_date >=`). */
export function dateKeyDaysBefore(todayKey: string, days: number): string {
  return addDaysKey(todayKey, -days);
}

/**
 * Agrega janelas inclusivas de 7 e 30 dias terminando em `todayKey` (inclui o dia
 * de hoje e os N-1 anteriores). `viewsTotal` (contador all-time) é repassado.
 */
export function summarizeStats(
  daily: DailyStatRow[],
  viewsTotal: number,
  todayKey: string,
): StatsSummary {
  const cutoff7 = addDaysKey(todayKey, -6);
  const cutoff30 = addDaysKey(todayKey, -29);
  let views7d = 0;
  let views30d = 0;
  let intents7d = 0;
  let intents30d = 0;
  for (const row of daily) {
    if (row.date > todayKey || row.date < cutoff30) continue;
    views30d += row.views;
    intents30d += row.intents;
    if (row.date >= cutoff7) {
      views7d += row.views;
      intents7d += row.intents;
    }
  }
  return { viewsTotal, views7d, views30d, intents7d, intents30d };
}

/**
 * Ranking de produtos mais procurados: ignora os sem cliques, ordena por cliques
 * (desc) com desempate estável por nome (pt-BR) e corta no top `limit`.
 */
export function topProductsByIntents(rows: TopProductRow[], limit: number): TopProductRow[] {
  return [...rows]
    .filter((row) => row.intents > 0)
    .sort((a, b) => b.intents - a.intents || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, Math.max(0, limit));
}

/**
 * Série diária contínua dos últimos `days` dias (mais antigo → hoje), preenchendo
 * com zero os dias sem registro. Alimenta o gráfico temporal (#0016 PR2).
 */
export function buildDailySeries(
  daily: DailyStatRow[],
  days: number,
  todayKey: string,
): DailyStatRow[] {
  const byDate = new Map(daily.map((row) => [row.date, row]));
  const series: DailyStatRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysKey(todayKey, -i);
    const row = byDate.get(date);
    series.push({ date, views: row?.views ?? 0, intents: row?.intents ?? 0 });
  }
  return series;
}

/**
 * Conta os cliques por origem (referrer normalizado). `source` nulo/vazio cai em
 * "direct". Ordena por contagem (desc), desempatando por nome da origem.
 */
export function aggregateSources(rows: { source: string | null }[]): SourceCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = row.source && row.source.trim() ? row.source : "direct";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count || a.source.localeCompare(b.source));
}
