/**
 * Validação estrutural de CPF/CNPJ (dígitos verificadores) — #0018. Usado no
 * checkout para barrar documento inválido antes de chamar o Asaas. É só validação
 * de formato; a conferência cadastral real fica a cargo do gateway/Receita.
 * Função pura (roda no cliente e no servidor); o CPF nunca é persistido por nós.
 */

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(cpf: string): boolean {
  const c = onlyDigits(cpf);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(c[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(c[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(c[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === Number(c[10]);
}

export function isValidCnpj(cnpj: string): boolean {
  const c = onlyDigits(cnpj);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;

  const digit = (len: number): number => {
    const weights =
      len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(c[i]) * weights[i]!;
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return digit(12) === Number(c[12]) && digit(13) === Number(c[13]);
}

/** Aceita CPF (11 dígitos) ou CNPJ (14 dígitos). */
export function isValidCpfCnpj(value: string): boolean {
  const c = onlyDigits(value);
  if (c.length === 11) return isValidCpf(c);
  if (c.length === 14) return isValidCnpj(c);
  return false;
}
