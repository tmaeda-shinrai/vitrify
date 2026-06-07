import { describe, expect, it } from "vitest";

import {
  loginSchema,
  newPasswordSchema,
  resetRequestSchema,
  signUpSchema,
} from "@/lib/validators/auth";

describe("loginSchema", () => {
  it("aceita credenciais válidas e normaliza o e-mail", () => {
    const result = loginSchema.parse({ email: "  Maria@Email.com ", password: "qualquer" });
    expect(result.email).toBe("maria@email.com");
  });

  it("rejeita e-mail inválido", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  const base = {
    fullName: "Maria Silva",
    email: "maria@email.com",
    password: "senha1234",
    confirmPassword: "senha1234",
    termsAccepted: true as const,
  };

  it("aceita cadastro válido", () => {
    expect(signUpSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita quando os termos não são aceitos", () => {
    expect(signUpSchema.safeParse({ ...base, termsAccepted: false }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, termsAccepted: undefined }).success).toBe(false);
  });

  it("rejeita senha com menos de 8 caracteres", () => {
    const result = signUpSchema.safeParse({
      ...base,
      password: "1234567",
      confirmPassword: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senhas que não conferem", () => {
    const result = signUpSchema.safeParse({ ...base, confirmPassword: "outra1234" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("confirmPassword");
    }
  });

  it("rejeita nome muito curto", () => {
    expect(signUpSchema.safeParse({ ...base, fullName: "M" }).success).toBe(false);
  });
});

describe("resetRequestSchema", () => {
  it("aceita e-mail válido", () => {
    expect(resetRequestSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    expect(resetRequestSchema.safeParse({ email: "x" }).success).toBe(false);
  });
});

describe("newPasswordSchema", () => {
  it("aceita nova senha válida e confirmada", () => {
    const result = newPasswordSchema.safeParse({
      password: "novaSenha1",
      confirmPassword: "novaSenha1",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita quando as senhas divergem", () => {
    const result = newPasswordSchema.safeParse({
      password: "novaSenha1",
      confirmPassword: "novaSenha2",
    });
    expect(result.success).toBe(false);
  });
});
