// Análise de uma partida em duas passagens, sempre com o perfil fixo
// (ANALYSIS_PROFILE). Só o motor do site: sem nuvem nem análises de terceiros,
// para o resultado ser o mesmo para todos.
// - Passagem 1: todas as posições, 1 linha.
// - Passagem 2: só as posições candidatas (deepCandidates), com várias linhas.
// Determinismo: 1 thread, hash fixo e "ucinewgame" no começo; as posições são
// sempre analisadas na mesma ordem. O motor entra como parâmetro (testável).
import { deepCandidates, terminalScore, type DeepLine } from "./classify";
import { MAX_PV, type AnalysisData } from "./compact";
import { ANALYSIS_PROFILE } from "./profile";
import type { EngineScore } from "./winprob";

export type EngineLike = {
  newGame: () => void;
  analyseDepth: (
    fen: string,
    options: { depth: number; multipv?: number; signal?: AbortSignal },
  ) => Promise<{
    lines: { move: string; score: EngineScore; pv: string[] }[];
    cancelled: boolean;
  }>;
};

export type Progress = {
  phase: 1 | 2;
  done: number;
  total: number;
};

export type PipelineInput = {
  fens: string[]; // posição depois de cada meia-jogada (fens[0] = início)
  moves: string[]; // lances em UCI
  ending: "mate" | "afogamento" | null;
  bookPlies: number;
  engine: EngineLike;
  signal?: AbortSignal;
  // Chamado a cada posição concluída, com os dados parciais (análise progressiva).
  onUpdate?: (data: AnalysisData, progress: Progress) => void;
};

export type PipelineResult = AnalysisData & { complete: boolean };

const turnOf = (fen: string) => (fen.split(" ")[1] === "b" ? "b" : "w");

const toWhite = (score: EngineScore, fen: string): EngineScore =>
  turnOf(fen) === "w" ? score : { kind: score.kind, value: -score.value };

export async function runAnalysis(
  input: PipelineInput,
): Promise<PipelineResult> {
  const { fens, moves, engine, signal } = input;
  const p = ANALYSIS_PROFILE;
  const data: AnalysisData = {
    version: 2,
    depth: p.depth,
    moves,
    evals: [],
    best: [],
    pv: [],
    deep: {},
  };
  const snapshot = (): AnalysisData => ({
    ...data,
    evals: [...data.evals],
    best: [...data.best],
    pv: [...data.pv],
    deep: { ...data.deep },
  });

  engine.newGame();
  const total = fens.length;
  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break;
    const fen = fens[i];
    if (i === total - 1 && input.ending) {
      // Fim de partida: não há lance para avaliar.
      data.evals.push(
        terminalScore(input.ending === "mate" ? "mate" : "empate", turnOf(fen)),
      );
      data.best.push(null);
      data.pv.push([]);
    } else {
      const result = await engine.analyseDepth(fen, {
        depth: p.depth,
        multipv: 1,
        signal,
      });
      const line = result.lines[0];
      if (result.cancelled || !line) break;
      data.evals.push(toWhite(line.score, fen));
      data.best.push(line.move);
      data.pv.push(line.pv.slice(0, MAX_PV));
    }
    input.onUpdate?.(snapshot(), { phase: 1, done: i + 1, total });
  }
  if (data.evals.length < total) return { ...snapshot(), complete: false };

  const candidates = deepCandidates(
    { fens, moves, evals: data.evals, best: data.best, pv: data.pv, deep: {}, bookPlies: input.bookPlies },
    p.maxDeepPositions,
  );
  for (let k = 0; k < candidates.length; k++) {
    if (signal?.aborted) return { ...snapshot(), complete: false };
    const ply = candidates[k];
    const fen = fens[ply];
    const result = await engine.analyseDepth(fen, {
      depth: p.deepDepth,
      multipv: p.deepLines,
      signal,
    });
    if (result.cancelled) return { ...snapshot(), complete: false };
    data.deep[ply] = result.lines.map(
      (line): DeepLine => ({
        move: line.move,
        score: toWhite(line.score, fen),
        pv: line.pv.slice(0, MAX_PV),
      }),
    );
    input.onUpdate?.(snapshot(), {
      phase: 2,
      done: k + 1,
      total: candidates.length,
    });
  }
  return { ...snapshot(), complete: true };
}
