import { describe, expect, it } from "vitest";

import { addDaysToDate, dueDateInDays } from "./dates";

describe("addDaysToDate", () => {
  it("adia dentro do mesmo ano", () => {
    expect(addDaysToDate("2026-06-30", 30)).toBe("2026-07-30");
  });

  it("atravessa a virada de ano", () => {
    expect(addDaysToDate("2026-12-20", 30)).toBe("2027-01-19");
  });

  it("respeita fevereiro (28 dias em 2026)", () => {
    expect(addDaysToDate("2026-02-15", 30)).toBe("2026-03-17");
  });

  it("data inválida volta inalterada", () => {
    expect(addDaysToDate("não-é-data", 30)).toBe("não-é-data");
  });
});

describe("dueDateInDays", () => {
  it("devolve YYYY-MM-DD válido", () => {
    expect(dueDateInDays(30)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
