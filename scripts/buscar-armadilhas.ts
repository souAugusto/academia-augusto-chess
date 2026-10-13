// Ajuda a escrever lições: procura "iscas" nas linhas de uma abertura.
// Para cada posição das linhas dadas, testa as capturas do lado indicado e
// mostra as que perdem muito segundo o Stockfish (candidatas a armadilha).
// Uso: node scripts/buscar-armadilhas.ts <brancas|pretas> "linha 1" ["linha 2" ...]
//   (linhas em SAN inglês separadas por espaço; o motor roda localmente)
import { Chess } from "chess.js";
import { winChance } from "../src/lib/analysis/winprob.ts";
import { NodeEngine } from "./motor-node.ts";

const DEPTH = Number(process.env.DEPTH ?? 13);
const MIN_LOSS = Number(process.env.MIN_LOSS ?? 25); // pontos de chance

const [sideArg, ...lines] = process.argv.slice(2);
const side = sideArg === "pretas" ? "b" : "w";
const engine = new NodeEngine();
const seen = new Set<string>();

try {
  for (const line of lines) {
    const chess = new Chess();
    const played: string[] = [];
    for (const san of line.trim().split(/\s+/)) {
      if (chess.turn() === side && !seen.has(chess.fen())) {
        seen.add(chess.fen());
        const fen = chess.fen();
        const [best] = await engine.analyse(fen, { depth: DEPTH });
        const captures = chess
          .moves({ verbose: true })
          .filter((move) => move.captured);
        for (const move of captures) {
          const [mine] = await engine.analyse(fen, {
            depth: DEPTH,
            searchmoves: [`${move.from}${move.to}${move.promotion ?? ""}`],
          });
          if (!best || !mine) continue;
          const loss = winChance(best.score) - winChance(mine.score);
          if (loss >= MIN_LOSS)
            console.log(
              `${played.join(" ")} | ${move.san}? perde ${loss.toFixed(0)} (resposta: ${mine.pv.slice(1, 4).join(" ")})`,
            );
        }
      }
      chess.move(san);
      played.push(san);
    }
  }
} finally {
  engine.quit();
}
process.exit(0);
