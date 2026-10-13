// Procura posições de rei e peão em que só UM lance mantém o resultado
// e esse lance cria oposição (direta, distante ou diagonal).
// Uso: node scripts/buscar-oposicao.ts <tipo: distante|diagonal|direta|todas> <quantidade>
import { Chess } from "chess.js";
import { winChance } from "../src/lib/analysis/winprob.ts";
import { NodeEngine } from "./motor-node.ts";

const kind = process.argv[2] ?? "distante";
const total = Number(process.argv[3] ?? 200);
const engine = new NodeEngine();
const files = "abcdefgh";
const sq = (f: number, r: number) => `${files[f]}${r + 1}`;
const rand = (n: number) => Math.floor(Math.random() * n);

function relation(a: string, b: string) {
  const df = Math.abs(a.charCodeAt(0) - b.charCodeAt(0));
  const dr = Math.abs(Number(a[1]) - Number(b[1]));
  if (df === 0 || dr === 0) {
    const gap = Math.max(df, dr) - 1;
    if (gap === 1) return "direta";
    if (gap % 2 === 1) return "distante";
  }
  if (df === dr && df % 2 === 0 && df >= 2) return "diagonal";
  return "";
}

let found = 0;
try {
  for (let i = 0; i < total; i++) {
    const board: Record<string, string> = {};
    const pf = 1 + rand(6),
      pr = 1 + rand(4); // peão branco b-g, fileiras 2-5
    board[sq(pf, pr)] = "P";
    const wk = sq(rand(8), rand(8)),
      bk = sq(rand(8), 2 + rand(6));
    if (board[wk] || board[bk] || wk === bk) continue;
    // Reis encostados são ilegais (e derrubam o motor).
    if (
      Math.abs(wk.charCodeAt(0) - bk.charCodeAt(0)) <= 1 &&
      Math.abs(Number(wk[1]) - Number(bk[1])) <= 1
    )
      continue;
    board[wk] = "K";
    board[bk] = "k";
    const rows: string[] = [];
    for (let r = 7; r >= 0; r--) {
      let row = "",
        empty = 0;
      for (let f = 0; f < 8; f++) {
        const p = board[sq(f, r)];
        if (p) {
          if (empty) row += empty;
          empty = 0;
          row += p;
        } else empty++;
      }
      if (empty) row += empty;
      rows.push(row);
    }
    const turn = rand(2) ? "w" : "b";
    const fen = `${rows.join("/")} ${turn} - - 0 1`;
    let chess: Chess;
    try {
      chess = new Chess(fen);
    } catch {
      continue;
    }
    if (chess.isGameOver() || chess.inCheck()) continue;
    // O lado que não joga também não pode estar em xeque.
    const other = new Chess(
      fen.replace(` ${turn} `, ` ${turn === "w" ? "b" : "w"} `),
    );
    if (other.inCheck()) continue;
    const moves = chess.moves({ verbose: true });
    const lines = await engine.analyse(fen, {
      depth: 18,
      multipv: Math.min(8, moves.length),
      maxMs: 8000,
    });
    if (lines.length < 2) continue;
    const best = winChance(lines[0].score);
    const goal =
      best >= 80 ? "vencer" : best >= 30 && best <= 70 ? "empatar" : "";
    if (!goal) continue;
    const ok = lines.filter((l) => {
      const c = winChance(l.score);
      return goal === "vencer" ? c >= 80 && best - c <= 8 : c >= 30;
    });
    // Até dois lances corretos, todos de rei e todos criando a oposição pedida.
    if (ok.length > 2 || ok.length === lines.length) continue;
    const goodSans: string[] = [];
    const relations = new Set<string>();
    let allMatch = true;
    for (const line of ok) {
      const move = moves.find((m) => `${m.from}${m.to}` === line.move);
      if (!move || move.piece !== "k") {
        allMatch = false;
        break;
      }
      const after = new Chess(fen);
      after.move(move.san);
      const kings = after
        .board()
        .flat()
        .filter((p) => p?.type === "k")
        .map((p) => p!.square);
      const rel = relation(kings[0], kings[1]);
      if (!rel || (kind !== "todas" && rel !== kind)) {
        allMatch = false;
        break;
      }
      relations.add(rel);
      goodSans.push(move.san);
    }
    if (!allMatch) continue;
    const move = { san: goodSans.join(" / ") };
    found++;
    console.log(`${[...relations].join(",")} | ${goal} | ${fen} | ${move.san}`);
  }
} finally {
  engine.quit();
}
console.log(`encontradas: ${found}`);
process.exit(0);
