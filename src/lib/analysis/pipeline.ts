// Calcula a avaliação de cada posição de uma partida, escolhendo a fonte mais
// barata disponível: análise já feita pelo Lichess, nuvem do Lichess (primeiras
// jogadas) e, por fim, o motor no navegador. Tudo sem custo para o servidor.
// O motor e o fetch entram como parâmetros para o código ser testável.
import type { AnalysisData, EvalSource } from "./compact";
import { terminalScore } from "./review";
import { CLOUD_MAX_PLIES, cloudEvalUrl, parseCloudEval } from "./sources";
import type { EngineScore } from "./winprob";

export type EngineLike = {
  analyseDepth: (
    fen: string,
    options: { depth: number; signal?: AbortSignal },
  ) => Promise<{
    lines: { move: string; score: EngineScore }[];
    cancelled: boolean;
  }>;
};

export type PipelineInput = {
  fens: string[]; // posição depois de cada meia-jogada (fens[0] = início)
  moves: string[]; // lances em UCI
  ending: "mate" | "afogamento" | null;
  depth: number;
  engine: EngineLike;
  lichessEvals?: (EngineScore | null)[] | null; // depois de cada lance
  useCloud?: boolean;
  fetchJson?: (url: string, signal?: AbortSignal) => Promise<unknown>;
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
};

export type PipelineResult = AnalysisData & { complete: boolean };

const turnOf = (fen: string) => (fen.split(" ")[1] === "b" ? "b" : "w");

const toWhite = (score: EngineScore, fen: string): EngineScore =>
  turnOf(fen) === "w" ? score : { kind: score.kind, value: -score.value };

export async function runAnalysis(
  input: PipelineInput,
): Promise<PipelineResult> {
  const { fens, moves, depth, engine, signal } = input;
  const evals: EngineScore[] = [];
  const best: (string | null)[] = [];
  const sources: EvalSource[] = [];
  let cloudActive = input.useCloud !== false && Boolean(input.fetchJson);
  const total = fens.length;

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break;
    const fen = fens[i];
    const last = i === total - 1;

    // Fim de partida: não há lance para avaliar.
    if (last && input.ending) {
      evals.push(
        terminalScore(input.ending === "mate" ? "mate" : "empate", turnOf(fen)),
      );
      best.push(null);
      sources.push("m");
      input.onProgress?.(i + 1, total);
      continue;
    }

    const fromLichess = i > 0 ? input.lichessEvals?.[i - 1] : null;
    if (fromLichess) {
      evals.push(fromLichess);
      best.push(null);
      sources.push("l");
      input.onProgress?.(i + 1, total);
      continue;
    }

    if (cloudActive && i < CLOUD_MAX_PLIES && input.fetchJson) {
      let cloud = null;
      try {
        cloud = parseCloudEval(
          await input.fetchJson(cloudEvalUrl(fen), signal),
        );
      } catch {
        cloud = null;
      }
      if (cloud) {
        evals.push(cloud.score);
        best.push(cloud.best);
        sources.push("n");
        input.onProgress?.(i + 1, total);
        continue;
      }
      // Fora da nuvem uma vez, fora para sempre: as próximas também não estão.
      cloudActive = false;
    }

    const result = await engine.analyseDepth(fen, { depth, signal });
    const line = result.lines[0];
    if (result.cancelled || !line) break;
    evals.push(toWhite(line.score, fen));
    best.push(line.move);
    sources.push("m");
    input.onProgress?.(i + 1, total);
  }

  return {
    depth,
    moves,
    evals,
    best,
    sources,
    complete: evals.length === total,
  };
}
