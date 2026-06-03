import { describe, expect, it } from "vitest";

import { dayLabel, groupIntentsByDay, type OrderIntentItem } from "@/lib/intents";

function item(id: string, createdAt: string): OrderIntentItem {
  return { id, productName: null, source: null, device: "desktop", createdAt };
}

describe("groupIntentsByDay", () => {
  it("agrupa por dia, mais recente primeiro", () => {
    const groups = groupIntentsByDay([
      item("a", "2026-06-03T10:00:00Z"),
      item("b", "2026-06-03T09:00:00Z"),
      item("c", "2026-06-01T12:00:00Z"),
    ]);
    expect(groups.map((g) => g.dayKey)).toEqual(["2026-06-03", "2026-06-01"]);
    expect(groups[0]!.items).toHaveLength(2);
  });
});

describe("dayLabel", () => {
  it("hoje / ontem / data", () => {
    const now = new Date("2026-06-03T12:00:00Z");
    expect(dayLabel("2026-06-03", now)).toBe("today");
    expect(dayLabel("2026-06-02", now)).toBe("yesterday");
    expect(dayLabel("2026-05-30", now)).toBe("2026-05-30");
  });
});
