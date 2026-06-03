import { describe, expect, it } from "vitest";

import { hexToHsl } from "@/lib/color";

describe("hexToHsl", () => {
  it("converte o roxo da marca para HSL (igual ao token --primary)", () => {
    expect(hexToHsl("#7C3AED")).toBe("262 83% 58%");
  });

  it("aceita sem # e em forma curta de 3 dígitos", () => {
    expect(hexToHsl("7C3AED")).toBe("262 83% 58%");
    expect(hexToHsl("#000")).toBe("0 0% 0%");
    expect(hexToHsl("#fff")).toBe("0 0% 100%");
  });

  it("retorna null para valor inválido", () => {
    expect(hexToHsl("roxo")).toBeNull();
    expect(hexToHsl("#12")).toBeNull();
  });
});
