// Ajuda a escrever lições de finais: procura posições de rei e peão (com um
// par de peões bloqueados) em que o plano vencedor do motor é a triangulação:
// o rei branco faz três lances e volta à casa de partida, passando a vez.
// Uso: node scripts/buscar-triangulacao.ts <quantidade>
import { Chess } from "chess.js";
import { winChance } from "../src/lib/analysis/winprob.ts";
import { NodeEngine } from "./motor-node.ts";

const total = Number(process.argv[2] ?? 300);
const engine = new NodeEngine();
const files = "abcdefgh";
const sq = (f: number, r: number) => `${files[f]}${r + 1}`;
const rand = (n: number) => Math.floor(Math.random() * n);

function toFen(board: Record<string, string>, turn: string) {
  const rows: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let row = "";
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const piece = board[sq(f, r)];
      if (piece) {
        if (empty) row += empty;
        empty = 0;
        row += piece;
      } else empty++;
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return `${rows.join("/")} ${turn} - - 0 1`;
}

const near = (a: string, b: string) =>
  Math.abs(a.charCodeAt(0) - b.charCodeAt(0)) <= 1 &&
  Math.abs(Number(a[1]) - Number(b[1])) <= 1;

let found = 0;
try {
  for (let i = 0; i < total; i++) {
    const board: Record<string, string> = {};
    // Par bloqueado: peão branco numa fileira, peão preto logo à frente.
    const f = rand(8);
    const r = 2 + rand(3);
    board[sq(f, r)] = "P";
    board[sq(f, r + 1)] = "p";
    // Um peão branco extra às vezes (mais chances de vitória).
    if (rand(2)) {
      const ef = rand(8);
      const er = 1 + rand(4);
      if (!board[sq(ef, er)]) board[sq(ef, er)] = "P";
    }
    const wk = sq(rand(8), rand(8));
    const bk = sq(rand(8), rand(8));
    if (board[wk] || board[bk] || wk === bk || near(wk, bk)) continue;
    board[wk] = "K";
    board[bk] = "k";
    const fen = toFen(board, "w");
    let chess: Chess;
    try {
      chess = new Chess(fen);
      if (new Chess(fen.replace(" w ", " b ")).inCheck()) continue;
    } catch {
      continue;
    }
    if (chess.isGameOver() || chess.inCheck()) continue;
    const lines = await engine.analyse(fen, {
      depth: 20,
      multipv: Math.min(6, chess.moves().length),
      maxMs: 12_000,
    });
    const line = lines[0];
    if (!line || winChance(line.score) < 80) continue;
    // Só interessa se for o único lance que vence (o plano é obrigatório).
    if (lines.filter((other) => winChance(other.score) >= 80).length !== 1)
      continue;
    // Triangulação: 1º, 3º e 5º lances são do rei branco, em sequência,
    // e o terceiro termina na casa de partida.
    const pv = line.pv.slice(0, 6);
    if (pv.length < 5) continue;
    const from = (uci: string) => uci.slice(0, 2);
    const to = (uci: string) => uci.slice(2, 4);
    if (
      from(pv[0]) !== wk ||
      from(pv[2]) !== to(pv[0]) ||
      from(pv[4]) !== to(pv[2]) ||
      to(pv[4]) !== wk
    )
      continue;
    // O rei preto precisa ter voltado também (mesma posição, outro a jogar).
    const board2 = new Chess(fen);
    const sans = pv.slice(0, 5).map(
      (uci) =>
        board2.move({
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          promotion: uci[4],
        }).san,
    );
    found++;
    console.log(`${fen} | ${sans.join(" ")}`);
  }
} finally {
  engine.quit();
}
console.log(`encontradas: ${found}`);
process.exit(0);
