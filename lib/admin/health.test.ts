import { describe, expect, it } from "vitest";

import { summarizeHealth, type ServiceHealth } from "@/lib/admin/health";

const ok: ServiceHealth = { name: "a", status: "ok", detail: "" };
const down: ServiceHealth = { name: "b", status: "down", detail: "" };
const unconf: ServiceHealth = { name: "c", status: "unconfigured", detail: "" };

describe("summarizeHealth", () => {
  it("ok quando todos ok", () => {
    expect(summarizeHealth([ok, ok])).toBe("ok");
  });

  it("down domina tudo", () => {
    expect(summarizeHealth([ok, unconf, down])).toBe("down");
  });

  it("unconfigured quando não há down mas há não-configurado", () => {
    expect(summarizeHealth([ok, unconf])).toBe("unconfigured");
  });
});
