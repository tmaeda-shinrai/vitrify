/**
 * Dinheiro é sempre armazenado em centavos (INT). A formatação para `R$ 32,90`
 * acontece só na camada de apresentação (DATABASE §2.5 / CONTRIBUTING).
 */

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Centavos → `R$ 32,90`. O `Intl` insere um espaço não-quebrável (nbsp) entre o
 * símbolo e o valor; normalizamos para espaço comum (`\s` casa nbsp em JS), o que
 * deixa a saída previsível para testes e comparações.
 */
export function formatBRL(cents: number): string {
  const value = (Number.isFinite(cents) ? cents : 0) / 100;
  return brlFormatter.format(value).replace(/\s/g, " ");
}

/**
 * Texto em reais → centavos (INT) ou `null` se inválido/negativo. Aceita máscara
 * brasileira (`1.299,90`, `R$ 32,90`) e também ponto decimal (`32.90`). Heurística:
 * o separador decimal é o que aparece mais à direita; o outro é milhar.
 */
export function parseBRLToCents(input: string): number | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[^\d.,-]/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;
  if (lastComma === -1 && lastDot === -1) {
    normalized = cleaned; // só dígitos: reais inteiros
  } else if (lastComma > lastDot) {
    normalized = cleaned.replace(/\./g, "").replace(",", "."); // vírgula decimal
  } else {
    normalized = cleaned.replace(/,/g, ""); // ponto decimal
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}
