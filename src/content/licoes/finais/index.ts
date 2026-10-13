import type { EndgameLesson } from "../types.ts";
import { mateDama } from "./mate-dama.ts";
import { mateTorre } from "./mate-torre.ts";
import { mateDuasTorres } from "./mate-duas-torres.ts";

// Lições de finais, do básico ao avançado. Cada lição fica no próprio arquivo.
export const ENDGAME_LESSONS: EndgameLesson[] = [
  mateDama,
  mateTorre,
  mateDuasTorres,
];
