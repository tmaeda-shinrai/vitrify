import { describe, expect, it } from "vitest";

import { moveById } from "@/lib/products";

const items = [{ id: "a" }, { id: "b" }, { id: "c" }];

describe("moveById", () => {
  it("move o item para a posição do destino", () => {
    expect(moveById(items, "a", "c").map((i) => i.id)).toEqual(["b", "c", "a"]);
    expect(moveById(items, "c", "a").map((i) => i.id)).toEqual(["c", "a", "b"]);
  });

  it("preserva a lista quando origem = destino ou id inexistente", () => {
    expect(moveById(items, "a", "a")).toBe(items);
    expect(moveById(items, "x", "a")).toBe(items);
  });
});
