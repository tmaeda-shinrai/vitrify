import { describe, expect, it } from "vitest";

import { intentSchema } from "@/lib/validators/intent";

describe("intentSchema", () => {
  it("aceita payload válido (com e sem produto)", () => {
    expect(
      intentSchema.safeParse({ slug: "maria", productId: "550e8400-e29b-41d4-a716-446655440000" })
        .success,
    ).toBe(true);
    expect(intentSchema.safeParse({ slug: "maria" }).success).toBe(true);
  });

  it("rejeita slug curto e productId não-uuid", () => {
    expect(intentSchema.safeParse({ slug: "ab" }).success).toBe(false);
    expect(intentSchema.safeParse({ slug: "maria", productId: "x" }).success).toBe(false);
  });
});
