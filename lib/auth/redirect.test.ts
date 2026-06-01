import { describe, expect, it } from "vitest";

import { DEFAULT_REDIRECT, sanitizeNext } from "@/lib/auth/redirect";

describe("sanitizeNext", () => {
  it("aceita caminho interno", () => {
    expect(sanitizeNext("/redefinir-senha")).toBe("/redefinir-senha");
    expect(sanitizeNext("/dashboard")).toBe("/dashboard");
  });

  it("rejeita URL absoluta e cai no default", () => {
    expect(sanitizeNext("https://evil.com")).toBe(DEFAULT_REDIRECT);
    expect(sanitizeNext("http://evil.com")).toBe(DEFAULT_REDIRECT);
  });

  it("rejeita protocol-relative (//) e cai no default", () => {
    expect(sanitizeNext("//evil.com")).toBe(DEFAULT_REDIRECT);
  });

  it("usa o default para null/undefined/vazio", () => {
    expect(sanitizeNext(null)).toBe(DEFAULT_REDIRECT);
    expect(sanitizeNext(undefined)).toBe(DEFAULT_REDIRECT);
    expect(sanitizeNext("")).toBe(DEFAULT_REDIRECT);
  });

  it("rejeita caminho que não começa com / (relativo)", () => {
    expect(sanitizeNext("dashboard")).toBe(DEFAULT_REDIRECT);
  });
});
