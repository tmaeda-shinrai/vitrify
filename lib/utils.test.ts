import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("concatena classes simples", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("resolve conflitos de classes do Tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
