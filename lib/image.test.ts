import { describe, expect, it } from "vitest";

import { ALLOWED_IMAGE_TYPES, isAllowedImageType, OUTPUT_IMAGE_TYPE } from "@/lib/image";

describe("isAllowedImageType", () => {
  it("aceita jpeg, png e webp", () => {
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/png")).toBe(true);
    expect(isAllowedImageType("image/webp")).toBe(true);
  });

  it("bloqueia SVG e outros", () => {
    expect(isAllowedImageType("image/svg+xml")).toBe(false);
    expect(isAllowedImageType("application/pdf")).toBe(false);
    expect(isAllowedImageType("text/html")).toBe(false);
  });

  it("a saída é sempre webp", () => {
    expect(OUTPUT_IMAGE_TYPE).toBe("image/webp");
    expect(ALLOWED_IMAGE_TYPES).not.toContain("image/svg+xml");
  });
});
