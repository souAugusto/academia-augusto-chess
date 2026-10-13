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
import { reiCortado } from "./rei-cortado.ts";
import { torrePeaoDeTorre } from "./torre-peao-de-torre.ts";
import { oposicaoDistante } from "./oposicao-distante.ts";
import { oposicaoDiagonal } from "./oposicao-diagonal.ts";
import { damaContraPeao } from "./dama-contra-peao.ts";
import { damaContraTorre } from "./dama-contra-torre.ts";
import { xequePerpetuo } from "./xeque-perpetuo.ts";
import { zugzwang } from "./zugzwang.ts";
import { peoesPassados } from "./peoes-passados.ts";
import { bisposCoresOpostas } from "./bispos-cores-opostas.ts";
import { bisposMesmaCor } from "./bispos-mesma-cor.ts";
import { bispoBomMau } from "./bispo-bom-mau.ts";
import { bispoContraCavalo } from "./bispo-contra-cavalo.ts";
import { finaisDeCavalo } from "./finais-de-cavalo.ts";
import { cavaloContraBispo } from "./cavalo-contra-bispo.ts";
import { triangulacao } from "./triangulacao.ts";

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
  reiCortado,
  torrePeaoDeTorre,
  oposicaoDistante,
  oposicaoDiagonal,
  damaContraPeao,
  damaContraTorre,
  xequePerpetuo,
  zugzwang,
  peoesPassados,
  bisposCoresOpostas,
  bisposMesmaCor,
  bispoBomMau,
  bispoContraCavalo,
  finaisDeCavalo,
  cavaloContraBispo,
  triangulacao,
];
