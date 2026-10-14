// Lista editável de palavras que não podem aparecer em apelidos.
// A comparação ignora maiúsculas, acentos, troca de letras por números
// (ex.: "p0rr4") e separadores ("_", ".", "-").
// Para incluir uma palavra, escreva em minúsculas e sem acento.

// Bloqueadas no começo de qualquer parte do apelido (ex.: "puta", "putaria").
export const PALAVRAS_PROIBIDAS = [
  "arrombad",
  "babaca",
  "bicha",
  "boceta",
  "buceta",
  "bosta",
  "brioco",
  "cacete",
  "caralh",
  "corno",
  "cuzao",
  "desgracad",
  "escrot",
  "fdp",
  "foda",
  "fode",
  "fuder",
  "idiota",
  "imbecil",
  "macaco",
  "merda",
  "nazi",
  "otario",
  "piranha",
  "porra",
  "puta",
  "puto",
  "retardad",
  "safad",
  "vadia",
  "viad",
  "xota",
  "xoxota",
] as const;

// Nomes reservados: ninguém pode usar, nem com variações de maiúsculas,
// separadores ou números no lugar de letras.
export const APELIDOS_RESERVADOS = [
  "admin",
  "administrador",
  "administracao",
  "augusto",
  "augustochess",
  "finale",
  "academiafinale",
  "suporte",
  "moderador",
  "moderacao",
  "staff",
  "equipe",
  "sistema",
  "root",
  "oficial",
] as const;

// Bloqueadas em qualquer posição do apelido, por imitarem a equipe
// (ex.: "admin_joao", "suporte.finale").
export const TRECHOS_RESERVADOS = [
  "admin",
  "moderador",
  "suporte",
  "finale",
] as const;
