import type { OpeningLesson } from "../types.ts";
import { italianaGiuocoPiano } from "./italiana-giuoco-piano.ts";
import { italianaGiuocoPianissimo } from "./italiana-giuoco-pianissimo.ts";
import { espanholaBerlim } from "./espanhola-berlim.ts";
import { espanholaFechada } from "./espanhola-fechada.ts";
import { espanholaAberta } from "./espanhola-aberta.ts";
import { escocesa } from "./escocesa.ts";
import { gambitoDamaAceito } from "./gambito-dama-aceito.ts";
import { gambitoDamaRecusado } from "./gambito-dama-recusado.ts";
import { inglesa } from "./inglesa.ts";
import { sistemaLondres } from "./sistema-londres.ts";
import { catala } from "./catala.ts";
import { gambitoDoRei } from "./gambito-do-rei.ts";
import { sicilianaNajdorf } from "./siciliana-najdorf.ts";

// Lições de aberturas, na ordem em que aparecem no site. Cada lição fica no
// próprio arquivo desta pasta.
export const OPENING_LESSONS: OpeningLesson[] = [
  italianaGiuocoPiano,
  italianaGiuocoPianissimo,
  espanholaBerlim,
  espanholaFechada,
  espanholaAberta,
  escocesa,
  gambitoDamaAceito,
  gambitoDamaRecusado,
  inglesa,
  sistemaLondres,
  catala,
  gambitoDoRei,
  sicilianaNajdorf,
];
