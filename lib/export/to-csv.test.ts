import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/export/to-csv";

describe("toCsv", () => {
  const columns = ["name", "price"] as const;

  it("gera cabeçalho e linhas na ordem das colunas", () => {
    const csv = toCsv([{ name: "Batom", price: 3290 }], columns);
    expect(csv).toBe("name,price\r\nBatom,3290");
  });

  it("escapa vírgulas, aspas e quebras de linha", () => {
    const csv = toCsv([{ name: 'Kit "verão", 3 itens', price: 100 }], columns);
    expect(csv).toContain('"Kit ""verão"", 3 itens"');
  });

  it("trata null/undefined como célula vazia", () => {
    const csv = toCsv([{ name: null, price: undefined }], columns);
    expect(csv).toBe("name,price\r\n,");
  });

  it("retorna só o cabeçalho quando não há linhas", () => {
    expect(toCsv([], columns)).toBe("name,price");
  });
});
