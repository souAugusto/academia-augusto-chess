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
import { sicilianaDragao } from "./siciliana-dragao.ts";
import { sicilianaScheveningen } from "./siciliana-scheveningen.ts";
import { sicilianaClassica } from "./siciliana-classica.ts";
import { sicilianaFechada } from "./siciliana-fechada.ts";
import { francesaAvanco } from "./francesa-avanco.ts";
import { francesaTroca } from "./francesa-troca.ts";
import { francesaTarrasch } from "./francesa-tarrasch.ts";
import { caroKannClassica } from "./caro-kann-classica.ts";
import { caroKannAvanco } from "./caro-kann-avanco.ts";
import { escandinava } from "./escandinava.ts";

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
  sicilianaDragao,
  sicilianaScheveningen,
  sicilianaClassica,
  sicilianaFechada,
  francesaAvanco,
  francesaTroca,
  francesaTarrasch,
  caroKannClassica,
  caroKannAvanco,
  escandinava,
];
