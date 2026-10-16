// Calibração da análise: roda o mesmo motor do site (Stockfish 19 lite, 1
// thread) no Node, com o perfil fixo, e mostra a classe de cada lance e os
// motivos de um lance não ser brilhante. Serve para ajustar CLASSIFY_CONFIG com
// partidas reais.
// Uso: npx tsx scripts/calibrar-analise.ts caminho/da/partida.pgn
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { CLASS_LABELS, CLASSIFY_CONFIG } from "../src/lib/analysis/classify";
import { sacrificeInLine } from "../src/lib/analysis/material";
import { parsePgn } from "../src/lib/analysis/pgn";
import { runAnalysis, type EngineLike } from "../src/lib/analysis/pipeline";
import { ANALYSIS_PROFILE } from "../src/lib/analysis/profile";
import { buildReport } from "../src/lib/analysis/report";
import { parseBook } from "../src/lib/analysis/theory";
import { parseBestMove, parseInfo, type Score } from "../src/lib/engine/uci";

const require = createRequire(import.meta.url);

function nodeEngine(): EngineLike & { quit: () => void } {
  let onLine: (line: string) => void = () => {};
  const engine = require("stockfish")("lite-single", (line: string) => onLine(line));
  engine.processCommand("uci");
  engine.processCommand(`setoption name Hash value ${ANALYSIS_PROFILE.hashMb}`);
  let multipv = 1;
  return {
    quit: () => engine.terminate(),
    newGame: () => engine.processCommand("ucinewgame"),
    analyseDepth: (fen, options) =>
      new Promise((resolve) => {
        const want = options.multipv ?? 1;
        if (want !== multipv) {
          multipv = want;
          engine.processCommand(`setoption name MultiPV value ${want}`);
        }
        const lines = new Map<number, { move: string; score: Score; pv: string[] }>();
        onLine = (line) => {
          if (parseBestMove(line) !== undefined) {
            resolve({
              lines: [...lines.entries()].sort(([a], [b]) => a - b).map(([, l]) => l),
              cancelled: false,
            });
            return;
          }
          const info = parseInfo(line);
          if (info && info.pv.length > 0)
            lines.set(info.multipv, { move: info.pv[0], score: info.score, pv: info.pv });
        };
        engine.processCommand(`position fen ${fen}`);
        engine.processCommand(`go depth ${options.depth}`);
      }),
  };
}

const file = process.argv[2];
if (!file) throw new Error("Informe o arquivo PGN.");
const parsed = parsePgn(readFileSync(file, "utf8"));
if (!parsed.ok) throw new Error(`PGN inválido: ${parsed.error}`);
const game = parsed.game;
const book = parseBook(JSON.parse(readFileSync("src/content/teoria-aberturas.json", "utf8")));
const engine = nodeEngine();
const started = Date.now();
const { theoryOf } = await import("../src/lib/analysis/theory");
const data = await runAnalysis({
  fens: game.fens,
  moves: game.ucis,
  ending: game.ending,
  bookPlies: theoryOf(game.fens, book).bookPlies,
  engine,
});
engine.quit();
const report = buildReport(data, game.fens, book);
console.log(`Tempo: ${((Date.now() - started) / 1000).toFixed(0)} s · ${game.ucis.length} meias-jogadas · passagem 2 em ${Object.keys(data.deep).length} posições`);
console.log(`Abertura: ${report.opening} · teoria: ${report.bookPlies} · precisão ${report.accuracy.w} / ${report.accuracy.b}`);
for (const move of report.reviewed) {
  const label = `${Math.floor(move.ply / 2) + 1}${move.ply % 2 ? "..." : "."}${game.sans[move.ply]}`;
  const rules = CLASSIFY_CONFIG.brilliant.sacrifice;
  const sac =
    sacrificeInLine(game.fens[move.ply], [move.played, ...(data.pv[move.ply + 1] ?? [])], rules) ??
    sacrificeInLine(game.fens[move.ply], game.ucis.slice(move.ply, move.ply + 7), rules);
  const notes = [
    `Δ ${move.loss.toFixed(1)}`,
    `antes ${move.before.toFixed(0)}`,
    `depois ${move.after.toFixed(0)}`,
    sac ? `sacrifício ${sac.piece} ${sac.amount}` : "",
    data.deep[move.ply] ? "passagem 2" : "",
  ].filter(Boolean);
  console.log(`${label.padEnd(12)} ${CLASS_LABELS[move.cls].padEnd(15)} ${notes.join(" · ")}`);
}
