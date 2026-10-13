// Avalia posições com o motor (uso local, para conferir afirmações das lições).
// Uso: node scripts/avaliar.ts "lances SAN desde o início" [profundidade]
//   ou node scripts/avaliar.ts --fen "<FEN>" [profundidade]
import { Chess } from "chess.js";
import { NodeEngine } from "./motor-node.ts";

const args = process.argv.slice(2);
const chess = new Chess();
let depth = 18;
if (args[0] === "--fen") {
  chess.load(args[1]);
  depth = Number(args[2] ?? depth);
} else {
  for (const san of args[0].trim().split(/\s+/)) chess.move(san);
  depth = Number(args[1] ?? depth);
}
const engine = new NodeEngine();
const lines = await engine.analyse(chess.fen(), { depth, multipv: Number(process.env.MULTIPV ?? 3), maxMs: 20000 });
const pov = chess.turn() === "w" ? "brancas" : "pretas";
console.log(`FEN ${chess.fen()} (vez das ${pov})`);
for (const line of lines) {
  const score = line.score.kind === "mate" ? `M${line.score.value}` : (line.score.value / 100).toFixed(2);
  const san: string[] = [];
  const copy = new Chess(chess.fen());
  for (const uci of line.pv.slice(0, Number(process.env.PVLEN ?? 8))) {
    try {
      san.push(copy.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] }).san);
    } catch {
      break;
    }
  }
  console.log(`  ${score.padStart(7)}  ${san.join(" ")}`);
}
engine.quit();
process.exit(0);
