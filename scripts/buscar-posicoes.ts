// Ajuda a escrever lições de finais: gera posições aleatórias com o material
// pedido e mostra as que têm UM único lance que mantém o resultado (vencer ou
// empatar), quando esse lance combina com o tema pedido.
// Uso: node scripts/buscar-posicoes.ts <brancas:pretas> <tema> <quantidade>
//   material: letras das peças além do rei, ex. "RPPP:RPP" ou "BP:N"
//   temas: qualquer | rei | peao | torre7 | xeque | captura | sacrificio | dama
// Exemplo: node scripts/buscar-posicoes.ts RPP:RP torre7 400
// Variável BISPOS=opostas|mesma filtra a cor dos bispos; ALA=rei põe os
// peões só na ala do rei.
import { Chess, type Move } from "chess.js";
import { winChance } from "../src/lib/analysis/winprob.ts";
import { NodeEngine } from "./motor-node.ts";

const [material = "RP:R", theme = "qualquer", count = "300"] =
  process.argv.slice(2);
const [whiteSet, blackSet] = material.split(":");
const engine = new NodeEngine();
const files = "abcdefgh";
const rand = (n: number) => Math.floor(Math.random() * n);
const square = (f: number, r: number) => `${files[f]}${r + 1}`;

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function matchesTheme(move: Move, after: Chess): boolean {
  switch (theme) {
    case "rei":
      return move.piece === "k";
    case "peao":
      return move.piece === "p";
    case "torre7": {
      const seventh = move.color === "w" ? "7" : "2";
      return move.piece === "r" && move.to[1] === seventh;
    }
    case "xeque":
      return after.inCheck();
    case "captura":
      return Boolean(move.captured);
    case "sacrificio":
      // Peça vai para uma casa atacada sem capturar algo de valor igual ou maior.
      return (
        after.isAttacked(move.to, after.turn()) &&
        VALUE[move.piece] > (move.captured ? VALUE[move.captured] : 0)
      );
    case "dama":
      return move.piece === "q";
    default:
      return true;
  }
}

function place(board: Map<string, string>, piece: string, white: boolean) {
  for (let tries = 0; tries < 50; tries++) {
    const isPawn = piece.toLowerCase() === "p";
    const rank = isPawn ? 1 + rand(6) : rand(8);
    // ALA=rei: peões só nas colunas e a h (finais com peões numa ala só).
    const file = isPawn && process.env.ALA === "rei" ? 4 + rand(4) : rand(8);
    const sq = square(file, rank);
    if (board.has(sq)) continue;
    board.set(sq, white ? piece.toUpperCase() : piece.toLowerCase());
    return true;
  }
  return false;
}

function toFen(board: Map<string, string>, turn: string) {
  const rows: string[] = [];
  for (let r = 7; r >= 0; r--) {
    let row = "";
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const piece = board.get(square(f, r));
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

let found = 0;
try {
  for (let i = 0; i < Number(count); i++) {
    const board = new Map<string, string>();
    let ok = place(board, "K", true) && place(board, "K", false);
    for (const piece of whiteSet ?? "") ok &&= place(board, piece, true);
    for (const piece of blackSet ?? "") ok &&= place(board, piece, false);
    if (!ok) continue;
    // BISPOS=opostas|mesma: exige bispos (um de cada lado) dessas cores.
    if (process.env.BISPOS) {
      const colorOf = (sq: string) =>
        (sq.charCodeAt(0) - 97 + Number(sq[1])) % 2;
      const white = [...board].find(([, p]) => p === "B")?.[0];
      const black = [...board].find(([, p]) => p === "b")?.[0];
      if (!white || !black) continue;
      const same = colorOf(white) === colorOf(black);
      if ((process.env.BISPOS === "mesma") !== same) continue;
    }
    const turn = rand(2) ? "w" : "b";
    const fen = toFen(board, turn);
    let chess: Chess;
    try {
      chess = new Chess(fen);
      const other = new Chess(
        fen.replace(` ${turn} `, ` ${turn === "w" ? "b" : "w"} `),
      );
      if (other.inCheck()) continue;
    } catch {
      continue;
    }
    if (chess.isGameOver() || chess.inCheck()) continue;
    // Posição "calma": nenhuma peça atacada e sem defesa (evita lances óbvios).
    let hanging = false;
    for (const row of chess.board())
      for (const piece of row) {
        if (!piece || piece.type === "k") continue;
        const enemy = piece.color === "w" ? "b" : "w";
        if (
          chess.isAttacked(piece.square, enemy) &&
          !chess.isAttacked(piece.square, piece.color)
        )
          hanging = true;
      }
    if (hanging) continue;
    const moves = chess.moves({ verbose: true });
    if (moves.length < 3) continue;
    const lines = await engine.analyse(fen, {
      depth: 18,
      multipv: Math.min(10, moves.length),
      maxMs: 10_000,
    });
    if (lines.length < 3) continue;
    const best = winChance(lines[0].score);
    const goal =
      best >= 80 ? "vencer" : best >= 35 && best <= 65 ? "empatar" : "";
    if (!goal) continue;
    const good = lines.filter((line) => {
      const chance = winChance(line.score);
      return goal === "vencer"
        ? chance >= 80 && best - chance <= 8
        : chance >= 30;
    });
    if (good.length !== 1) continue;
    const move = moves.find(
      (m) => `${m.from}${m.to}${m.promotion ?? ""}` === good[0].move,
    );
    if (!move) continue;
    const after = new Chess(fen);
    after.move(move.san);
    if (!matchesTheme(move, after)) continue;
    if (move.captured && theme !== "captura") continue;
    found++;
    console.log(`${goal} | ${fen} | ${move.san}`);
  }
} finally {
  engine.quit();
}
console.log(`encontradas: ${found}`);
process.exit(0);
