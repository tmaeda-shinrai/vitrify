import { describe, expect, it } from "vitest";

import { isValidCnpj, isValidCpf, isValidCpfCnpj, onlyDigits } from "./cpf-cnpj";

describe("onlyDigits", () => {
  it("remove máscara", () => {
    expect(onlyDigits("111.444.777-35")).toBe("11144477735");
    expect(onlyDigits("11.222.333/0001-81")).toBe("11222333000181");
  });
});

describe("isValidCpf", () => {
  it("aceita CPF válido (com ou sem máscara)", () => {
    expect(isValidCpf("11144477735")).toBe(true);
    expect(isValidCpf("111.444.777-35")).toBe(true);
  });

  it("rejeita dígito verificador errado, repetição e tamanho", () => {
    expect(isValidCpf("11144477734")).toBe(false);
    expect(isValidCpf("00000000000")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
});

describe("isValidCnpj", () => {
  it("aceita CNPJ válido", () => {
    expect(isValidCnpj("11222333000181")).toBe(true);
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("rejeita inválido e repetido", () => {
    expect(isValidCnpj("11222333000180")).toBe(false);
    expect(isValidCnpj("00000000000000")).toBe(false);
  });
});

describe("isValidCpfCnpj", () => {
  it("aceita CPF (11) ou CNPJ (14)", () => {
    expect(isValidCpfCnpj("111.444.777-35")).toBe(true);
    expect(isValidCpfCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("rejeita comprimento intermediário", () => {
    expect(isValidCpfCnpj("1114447773")).toBe(false); // 10 dígitos
    expect(isValidCpfCnpj("")).toBe(false);
  });
});
