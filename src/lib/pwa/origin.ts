// Origem da visita na página do app (/app?origem=instagram). Não há
// ferramenta de métricas no site: guardamos só no aparelho, a primeira origem
// e a última, para consulta futura.

export const STORAGE_ORIGIN = "finale:origem";

export type StoredOrigin = { primeira: string; ultima: string; em: number };

// Aceita só letras, números, "-" e "_" (até 40), em minúsculas.
export function sanitizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  const clean = value.trim().toLowerCase();
  return /^[a-z0-9_-]{1,40}$/.test(clean) ? clean : null;
}

export function nextOrigin(
  previous: StoredOrigin | null,
  origin: string,
  now: number,
): StoredOrigin {
  return { primeira: previous?.primeira ?? origin, ultima: origin, em: now };
}
