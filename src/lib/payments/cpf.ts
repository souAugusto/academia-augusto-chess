// CPF: o Asaas exige o documento do pagador para criar a cobrança.

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

function checkDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

// Confere os dois dígitos verificadores. Sequências repetidas (111.111.111-11) são inválidas.
export function isValidCpf(value: string): boolean {
  const digits = normalizeCpf(value);
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) return false;
  return (
    checkDigit(digits, 9) === Number(digits[9]) &&
    checkDigit(digits, 10) === Number(digits[10])
  );
}
