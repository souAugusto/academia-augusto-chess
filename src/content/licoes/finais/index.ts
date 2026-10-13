import type { EndgameLesson } from "../types.ts";
import { mateDama } from "./mate-dama.ts";
import { mateTorre } from "./mate-torre.ts";
import { mateDuasTorres } from "./mate-duas-torres.ts";
import { mateDoisBispos } from "./mate-dois-bispos.ts";
import { mateBispoCavalo } from "./mate-bispo-cavalo.ts";
import { oposicaoDireta } from "./oposicao-direta.ts";
import { regraDoQuadrado } from "./regra-do-quadrado.ts";
import { regraDeReti } from "./regra-de-reti.ts";
import { lucena } from "./lucena.ts";
import { philidorTorre } from "./philidor-torre.ts";
import { casasChave } from "./casas-chave.ts";
import { brecha } from "./brecha.ts";
import { torreAtrasDoPassado } from "./torre-atras-do-passado.ts";

// Lições de finais, do básico ao avançado. Cada lição fica no próprio arquivo.
export const ENDGAME_LESSONS: EndgameLesson[] = [
  mateDama,
  mateTorre,
  mateDuasTorres,
  mateDoisBispos,
  mateBispoCavalo,
  oposicaoDireta,
  regraDoQuadrado,
  regraDeReti,
  lucena,
  philidorTorre,
  casasChave,
  brecha,
  torreAtrasDoPassado,
];
