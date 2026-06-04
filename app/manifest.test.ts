import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("manifest do PWA", () => {
  const m = manifest();

  it("é instalável: display standalone, start_url e scope", () => {
    expect(m.display).toBe("standalone");
    expect(m.start_url).toBe("/produtos");
    expect(m.scope).toBe("/");
  });

  it("traz ícones 192, 512 e um maskable", () => {
    const sizes = m.icons?.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(m.icons?.some((icon) => icon.purpose === "maskable")).toBe(true);
  });

  it("usa as cores da marca", () => {
    expect(m.theme_color).toBe("#7C3AED");
    expect(m.background_color).toBe("#F9FAFB");
  });

  it("tem os atalhos de adicionar produto e ver vitrine", () => {
    const urls = m.shortcuts?.map((shortcut) => shortcut.url);
    expect(urls).toContain("/produtos?novo=1");
    expect(urls).toContain("/minha-vitrine");
  });
});
