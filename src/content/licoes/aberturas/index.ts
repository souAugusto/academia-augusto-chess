import type { OpeningLesson } from "../types.ts";
import { italianaGiuocoPiano } from "./italiana-giuoco-piano.ts";
import { italianaGiuocoPianissimo } from "./italiana-giuoco-pianissimo.ts";
import { espanholaBerlim } from "./espanhola-berlim.ts";
import { espanholaFechada } from "./espanhola-fechada.ts";
import { espanholaAberta } from "./espanhola-aberta.ts";

// Lições de aberturas, na ordem em que aparecem no site. Cada lição fica no
// próprio arquivo desta pasta.
export const OPENING_LESSONS: OpeningLesson[] = [
  italianaGiuocoPiano,
  italianaGiuocoPianissimo,
  espanholaBerlim,
  espanholaFechada,
  espanholaAberta,
];
