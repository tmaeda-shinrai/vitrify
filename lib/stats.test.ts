import { describe, expect, it } from "vitest";

import {
  dateKeyInSaoPaulo,
  summarizeStats,
  topProductsByIntents,
  type DailyStatRow,
  type TopProductRow,
} from "@/lib/stats";

function day(date: string, views: number, intents: number): DailyStatRow {
  return { date, views, intents };
}

describe("summarizeStats", () => {
  const today = "2026-06-30";

  it("soma janelas inclusivas de 7 e 30 dias terminando hoje", () => {
    const daily: DailyStatRow[] = [
      day("2026-06-30", 10, 1), // hoje → 7d e 30d
      day("2026-06-24", 5, 2), // hoje-6 → limite do 7d (incluído)
      day("2026-06-10", 7, 3), // dentro do 30d, fora do 7d
      day("2026-06-01", 4, 1), // hoje-29 → limite do 30d (incluído)
    ];
    const summary = summarizeStats(daily, 999, today);
    expect(summary.viewsTotal).toBe(999);
    expect(summary.views7d).toBe(15);
    expect(summary.intents7d).toBe(3);
    expect(summary.views30d).toBe(26);
    expect(summary.intents30d).toBe(7);
  });

  it("exclui dias fora das janelas (antes de hoje-29) e o futuro", () => {
    const daily: DailyStatRow[] = [
      day("2026-05-31", 100, 50), // hoje-30 → fora do 30d
      day("2026-07-01", 100, 50), // futuro → ignorado
      day("2026-06-30", 1, 1),
    ];
    const summary = summarizeStats(daily, 1, today);
    expect(summary.views30d).toBe(1);
    expect(summary.intents30d).toBe(1);
    expect(summary.views7d).toBe(1);
  });

  it("zera tudo quando não há linhas", () => {
    expect(summarizeStats([], 0, today)).toEqual({
      viewsTotal: 0,
      views7d: 0,
      views30d: 0,
      intents7d: 0,
      intents30d: 0,
    });
  });
});

describe("topProductsByIntents", () => {
  const rows: TopProductRow[] = [
    { id: "a", name: "Batom", intents: 3 },
    { id: "b", name: "Perfume", intents: 10 },
    { id: "c", name: "Creme", intents: 0 },
    { id: "d", name: "Anel", intents: 3 },
  ];

  it("ordena por cliques desc, desempata por nome e ignora os sem cliques", () => {
    const top = topProductsByIntents(rows, 5);
    expect(top.map((r) => r.id)).toEqual(["b", "d", "a"]); // 10, 3(Anel), 3(Batom)
    expect(top.some((r) => r.id === "c")).toBe(false);
  });

  it("respeita o limite", () => {
    expect(topProductsByIntents(rows, 1).map((r) => r.id)).toEqual(["b"]);
    expect(topProductsByIntents(rows, 0)).toEqual([]);
  });
});

describe("dateKeyInSaoPaulo", () => {
  it("formata YYYY-MM-DD no fuso BRT (UTC-3)", () => {
    // 02:00Z = 23:00 do dia anterior em São Paulo.
    expect(dateKeyInSaoPaulo(new Date("2026-06-03T02:00:00Z"))).toBe("2026-06-02");
    expect(dateKeyInSaoPaulo(new Date("2026-06-03T12:00:00Z"))).toBe("2026-06-03");
  });
});
