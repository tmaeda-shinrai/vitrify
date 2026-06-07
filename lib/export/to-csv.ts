/**
 * Serialização CSV pura (#0021) para a portabilidade de dados (export de produtos).
 * Sem dependências; escapa aspas/quebras/; conforme RFC 4180.
 */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Gera CSV a partir de uma lista de objetos. `columns` define a ordem e quais
 * chaves entram; a primeira linha é o cabeçalho. Linhas terminam em CRLF.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: readonly (keyof T & string)[],
): string {
  const header = columns.map(escapeCell).join(",");
  const body = rows.map((row) => columns.map((col) => escapeCell(row[col])).join(","));
  return [header, ...body].join("\r\n");
}
