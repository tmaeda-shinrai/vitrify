/**
 * Apresentação da tela "Pedidos" (#0015). Helpers puros para agrupar as intenções
 * por dia, testáveis e sem dependências de servidor.
 */
export interface OrderIntentItem {
  id: string;
  productName: string | null;
  source: string | null;
  device: string | null;
  createdAt: string;
}

export interface IntentDayGroup {
  /** Chave do dia `YYYY-MM-DD` (UTC) — formatada na apresentação. */
  dayKey: string;
  items: OrderIntentItem[];
}

/** Agrupa por dia (mais recente primeiro); assume `intents` já ordenado desc. */
export function groupIntentsByDay(intents: OrderIntentItem[]): IntentDayGroup[] {
  const groups = new Map<string, OrderIntentItem[]>();
  for (const intent of intents) {
    const dayKey = intent.createdAt.slice(0, 10);
    const items = groups.get(dayKey) ?? [];
    items.push(intent);
    groups.set(dayKey, items);
  }
  return [...groups.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([dayKey, items]) => ({ dayKey, items }));
}

/** `"today"`/`"yesterday"` (chaves i18n) ou a própria dayKey (formatar na UI). */
export function dayLabel(dayKey: string, now: Date = new Date()): string {
  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  if (dayKey === toKey(now)) return "today";
  if (dayKey === toKey(new Date(now.getTime() - 86_400_000))) return "yesterday";
  return dayKey;
}
