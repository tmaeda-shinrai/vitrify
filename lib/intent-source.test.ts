import { describe, expect, it } from "vitest";

import { hashIp, shortUserAgent, sourceFromReferrer } from "@/lib/intent-source";

const APP = "https://vitrinio.com.br";

describe("sourceFromReferrer", () => {
  it("mapeia redes conhecidas", () => {
    expect(sourceFromReferrer("https://www.instagram.com/maria", APP)).toBe("instagram");
    expect(sourceFromReferrer("https://l.facebook.com/", APP)).toBe("facebook");
    expect(sourceFromReferrer("https://wa.me/", APP)).toBe("whatsapp");
    expect(sourceFromReferrer("https://www.google.com.br/search", APP)).toBe("google");
  });

  it("vazio, mesmo host ou inválido → direct", () => {
    expect(sourceFromReferrer("", APP)).toBe("direct");
    expect(sourceFromReferrer(null, APP)).toBe("direct");
    expect(sourceFromReferrer("https://vitrinio.com.br/maria", APP)).toBe("direct");
    expect(sourceFromReferrer("não-é-url", APP)).toBe("direct");
  });
});

describe("shortUserAgent", () => {
  it("classifica em 3 categorias", () => {
    expect(shortUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe(
      "mobile-ios",
    );
    expect(shortUserAgent("Mozilla/5.0 (Linux; Android 14)")).toBe("mobile-android");
    expect(shortUserAgent("Mozilla/5.0 (Windows NT 10.0)")).toBe("desktop");
    expect(shortUserAgent(null)).toBe("desktop");
  });
});

describe("hashIp", () => {
  it("gera SHA-256 hex determinístico e nunca o IP cru", () => {
    const hash = hashIp("203.0.113.7");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain("203.0.113.7");
    expect(hashIp("203.0.113.7")).toBe(hash);
  });
});
