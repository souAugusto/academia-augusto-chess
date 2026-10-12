// Contas com datas "AAAA-MM-DD" (sem fuso: o dia já vem em horário de Brasília).

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}
