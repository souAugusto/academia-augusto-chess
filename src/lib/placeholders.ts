// Detecta placeholders de texto como "[DIA E HORÁRIO DA LIVE]" (PROMPT_MESTRE.md, seção 8.7).
// Regra: "[" seguido de MAIÚSCULAS (pelo menos 3 no início); depois disso vale
// qualquer texto até o "]", como em "[DEFINIR BENEFÍCIO: preço travado]". Ignora
// acesso a índice (ex.: MAPA[CHAVE]), que vem colado a um identificador, "]" ou ")".
const PLACEHOLDER = /(?<![\w\])])\[[A-ZÀ-Ý][A-ZÀ-Ý0-9 ]{2,}[^\]\n]*\]/gu;

export type PlaceholderMatch = { line: number; text: string };

export function findPlaceholders(source: string): PlaceholderMatch[] {
  const matches: PlaceholderMatch[] = [];
  source.split(/\r?\n/).forEach((content, index) => {
    for (const match of content.matchAll(PLACEHOLDER)) {
      matches.push({ line: index + 1, text: match[0] });
    }
  });
  return matches;
}
