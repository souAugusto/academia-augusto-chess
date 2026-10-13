// Ajuda a escrever lições de finais: para cada FEN, mostra a avaliação, a
// linha principal do motor e os lances do primeiro movimento que mantêm o
// mesmo resultado (bons candidatos para "accept").
// Uso: node scripts/resolver-final.ts <vencer|empatar> "FEN" ["FEN" ...]
//   env DEPTH (padrão 20), PLIES (tamanho da linha, padrão 6)
import { Chess } from "chess.js";
import { winChance } from "../src/lib/analysis/winprob.ts";
import { NodeEngine } from "./motor-node.ts";

const DEPTH = Number(process.env.DEPTH ?? 20);
const PLIES = Number(process.env.PLIES ?? 6);
const [goal, ...fens] = process.argv.slice(2);
const engine = new NodeEngine();

const show = (s: { kind: string; value: number }) =>
  s.kind === "mate" ? `M${s.value}` : (s.value / 100).toFixed(2);

try {
  for (const fen of fens) {
    const chess = new Chess(fen);
    const lines = await engine.analyse(fen, {
      depth: DEPTH,
      multipv: Math.min(8, chess.moves().length),
      maxMs: 30_000,
    });
    const best = lines[0];
    if (!best) continue;
    const san = (uci: string, board: Chess) =>
      board.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4],
      }).san;
    const pvBoard = new Chess(fen);
    const pv = best.pv.slice(0, PLIES).map((uci) => san(uci, pvBoard));
    const keeps = lines.filter((line) => {
      const chance = winChance(line.score);
      if (goal === "vencer")
        return (
          (best.score.kind === "mate" &&
            line.score.kind === "mate" &&
            line.score.value > 0) ||
          (chance >= 80 && winChance(best.score) - chance <= 8)
        );
      return chance >= 30;
    });
    console.log(`\n${fen}`);
    console.log(`  melhor: ${show(best.score)}  linha: ${pv.join(" ")}`);
    console.log(
      `  mantêm o resultado: ${keeps.map((line) => `${san(line.move, new Chess(fen))} (${show(line.score)})`).join(", ")}`,
    );
  }
} finally {
  engine.quit();
}
process.exit(0);
