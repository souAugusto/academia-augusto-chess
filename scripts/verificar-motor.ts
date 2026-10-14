// Confere com o Stockfish (localmente, sem custo) as práticas das lições:
// - finais: o resultado declarado (vencer/empatar) é real e cada lance do aluno
//   na solução mantém esse resultado, sem perder chance relevante;
// - aberturas: o lance pedido está perto do melhor do motor (sanidade de teoria).
// Uso: npm run verify:engine [-- slug1 slug2]
// Resultados ficam em cache em scripts/.cache/motor.json (fora do Git).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";
import { ALL_LESSONS } from "../src/content/licoes/index.ts";
import type {
  EndgameLesson,
  OpeningLesson,
} from "../src/content/licoes/types.ts";
import { winChance, type EngineScore } from "../src/lib/analysis/winprob.ts";
import { NodeEngine } from "./motor-node.ts";

const ENDGAME_DEPTH = 20;
const OPENING_DEPTH = 15;
const WIN = 80; // chance mínima para chamar de "ganho"
const NOT_LOSING = 30; // chance mínima para chamar de "segura o empate"
const MAX_LOSS_ENDGAME = 8; // pontos de chance que o lance do aluno pode perder
const MAX_LOSS_OPENING = 10;
const WARN_LOSS_OPENING = 6;
// Linhas explicadas (principal e variantes): nenhum lance pode ser um erro claro.
const LINE_DEPTH = 13;
const MAX_LOSS_LINE = 15;
const WARN_LOSS_LINE = 9;
const TRAP_EDGE = 65; // chance mínima do lado favorecido no fim da armadilha

const CACHE_FILE = "scripts/.cache/motor.json";
const cache: Record<string, EngineScore> = existsSync(CACHE_FILE)
  ? JSON.parse(readFileSync(CACHE_FILE, "utf8"))
  : {};
const saveCache = () => {
  mkdirSync("scripts/.cache", { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(cache));
};

const engine = new NodeEngine();

async function scoreOf(
  fen: string,
  depth: number,
  move?: string,
): Promise<EngineScore> {
  const key = `${fen}|${move ?? "*"}|${depth}`;
  if (cache[key]) return cache[key];
  const [line] = await engine.analyse(fen, {
    depth,
    searchmoves: move ? [move] : undefined,
    maxMs: 15_000,
  });
  if (!line) throw new Error(`motor sem resposta em ${fen}`);
  cache[key] = line.score;
  return line.score;
}

function uciOf(fen: string, san: string): string {
  const move = new Chess(fen).move(san);
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

const show = (score: EngineScore) =>
  score.kind === "mate"
    ? `M${score.value}`
    : `${(score.value / 100).toFixed(2)}`;

const problems: string[] = [];
const warnings: string[] = [];

async function checkUserMove(
  fen: string,
  san: string,
  goal: "vencer" | "empatar",
  where: string,
) {
  const best = await scoreOf(fen, ENDGAME_DEPTH);
  const mine = await scoreOf(fen, ENDGAME_DEPTH, uciOf(fen, san));
  const bestChance = winChance(best);
  const mineChance = winChance(mine);
  if (goal === "vencer" && bestChance < WIN)
    problems.push(
      `${where}: a posição não parece ganha (melhor ${show(best)})`,
    );
  if (goal === "empatar" && bestChance < NOT_LOSING)
    problems.push(`${where}: a posição parece perdida (melhor ${show(best)})`);
  const keepsResult =
    goal === "vencer"
      ? mineChance >= WIN ||
        (best.kind === "mate" && mine.kind === "mate" && mine.value > 0)
      : mineChance >= NOT_LOSING;
  const loss = bestChance - mineChance;
  const mateKept =
    best.kind === "mate" &&
    best.value > 0 &&
    mine.kind === "mate" &&
    mine.value > 0;
  if (!keepsResult || (!mateKept && loss > MAX_LOSS_ENDGAME))
    problems.push(
      `${where}: ${san} (${show(mine)}) é pior que o melhor do motor (${show(best)})`,
    );
}

async function checkEndgame(lesson: EndgameLesson) {
  for (const [index, drill] of lesson.practice.entries()) {
    const where = `${lesson.slug} prática ${index + 1}`;
    const chess = new Chess(drill.fen);
    for (const [ply, san] of drill.solution.entries()) {
      // Só os lances do aluno (posições pares da solução) precisam ser os melhores.
      if (ply % 2 === 0)
        await checkUserMove(
          chess.fen(),
          san,
          drill.goal,
          `${where} lance ${ply + 1}`,
        );
      chess.move(san);
    }
    for (const san of drill.accept ?? [])
      await checkUserMove(
        drill.fen,
        san,
        drill.goal,
        `${where} alternativa ${san}`,
      );
  }
}

async function checkOpening(lesson: OpeningLesson) {
  await checkLine(
    lesson.mainLine.map((move) => move.san),
    `${lesson.slug} linha principal`,
  );
  for (const variation of lesson.variations)
    await checkLine(
      variation.moves.map((move) => move.san),
      `${lesson.slug} variante "${variation.name}"`,
    );
  for (const trap of lesson.traps)
    await checkTrap(trap, `${lesson.slug} armadilha "${trap.name}"`);
  for (const [index, drill] of lesson.practice.entries()) {
    const chess = new Chess();
    for (const san of drill.before) chess.move(san);
    const fen = chess.fen();
    const best = await scoreOf(fen, OPENING_DEPTH);
    for (const san of [drill.answer, ...(drill.alternatives ?? [])]) {
      const mine = await scoreOf(fen, OPENING_DEPTH, uciOf(fen, san));
      const loss = winChance(best) - winChance(mine);
      const where = `${lesson.slug} prática ${index + 1} (${san}: ${show(mine)}, melhor ${show(best)})`;
      if (loss > MAX_LOSS_OPENING)
        problems.push(`${where}: perde ${loss.toFixed(1)} pontos de chance`);
      else if (loss > WARN_LOSS_OPENING)
        warnings.push(`${where}: perde ${loss.toFixed(1)} pontos`);
    }
  }
}

async function checkLine(moves: string[], where: string) {
  const chess = new Chess();
  for (const [ply, san] of moves.entries()) {
    const fen = chess.fen();
    const best = await scoreOf(fen, LINE_DEPTH);
    const mine = await scoreOf(fen, LINE_DEPTH, uciOf(fen, san));
    const loss = winChance(best) - winChance(mine);
    const label = `${where} lance ${Math.floor(ply / 2) + 1}${ply % 2 ? "..." : "."}${san} (${show(mine)}, melhor ${show(best)})`;
    if (loss > MAX_LOSS_LINE)
      problems.push(`${label}: perde ${loss.toFixed(1)}`);
    else if (loss > WARN_LOSS_LINE)
      warnings.push(`${label}: perde ${loss.toFixed(1)}`);
    chess.move(san);
  }
}

async function checkTrap(trap: OpeningLesson["traps"][number], where: string) {
  const chess = new Chess();
  for (const san of trap.moves) chess.move(san);
  const whiteFavored = trap.favors === "brancas";
  if (chess.isCheckmate()) {
    // Quem acabou de dar mate é o lado que NÃO está na vez.
    const winnerIsWhite = chess.turn() === "b";
    if (winnerIsWhite !== whiteFavored)
      problems.push(`${where}: termina em mate para o lado errado`);
    return;
  }
  const score = await scoreOf(chess.fen(), OPENING_DEPTH);
  // Pontuação do motor é do lado que joga; converte para o lado favorecido.
  const sideToMoveIsFavored = (chess.turn() === "w") === whiteFavored;
  const chance = sideToMoveIsFavored
    ? winChance(score)
    : 100 - winChance(score);
  if (chance < TRAP_EDGE)
    problems.push(
      `${where}: no fim da linha o lado favorecido tem só ${chance.toFixed(0)}% (${show(score)} para quem joga)`,
    );
}

const filter = process.argv.slice(2);
const lessons = ALL_LESSONS.filter(
  (lesson) => filter.length === 0 || filter.includes(lesson.slug),
);
try {
  for (const lesson of lessons) {
    process.stdout.write(`${lesson.slug}... `);
    if (lesson.kind === "final") await checkEndgame(lesson);
    else await checkOpening(lesson);
    saveCache();
    console.log("ok");
  }
} finally {
  saveCache();
  engine.quit();
}

for (const warning of warnings) console.log(`aviso: ${warning}`);
if (problems.length > 0) {
  console.error(`\n${problems.length} problema(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`\n${lessons.length} lição(ões) conferida(s) pelo motor.`);
process.exit(0);
