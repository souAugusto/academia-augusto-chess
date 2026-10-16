"use client";

import { ANALYSIS_PROFILE } from "@/lib/analysis/profile";
import { parseBestMove, parseInfo, type Score } from "./uci";

// Cliente do Stockfish no navegador. O motor (GPL) roda como programa separado,
// num Web Worker servido de /engine/, e só troca mensagens UCI com o site.
const ENGINE_URL = ANALYSIS_PROFILE.engineFile;

export type Analysis = {
  bestMove: string | null;
  score: Score | null;
  depth: number;
};

// Uma linha da análise por profundidade (com multipv).
export type EngineLine = { move: string; score: Score; pv: string[] };

export type DepthAnalysis = {
  lines: EngineLine[]; // ordenadas: a primeira é a melhor
  depth: number; // profundidade atingida
  cancelled: boolean;
};

type Pending = {
  onInfo: (line: string) => void;
  onBest: (best: string | null) => void;
  reject: (error: Error) => void;
};

export class StockfishClient {
  worker: Worker;
  ready: Promise<void>;
  pending: Pending | null = null;
  queue: Promise<unknown> = Promise.resolve();
  multipv = 1;

  constructor() {
    this.worker = new Worker(ENGINE_URL);
    this.ready = new Promise((resolve, reject) => {
      const onBoot = (event: MessageEvent<string>) => {
        if (event.data === "readyok") {
          this.worker.removeEventListener("message", onBoot);
          resolve();
        }
      };
      this.worker.addEventListener("message", onBoot);
      this.worker.addEventListener(
        "error",
        () => reject(new Error("O motor não carregou.")),
        { once: true },
      );
    });
    this.worker.addEventListener("message", (event: MessageEvent<string>) =>
      this.onLine(event.data),
    );
    this.send("uci");
    this.send(`setoption name Hash value ${ANALYSIS_PROFILE.hashMb}`);
    this.send(`setoption name Threads value ${ANALYSIS_PROFILE.threads}`);
    this.send("isready");
  }

  send(command: string) {
    this.worker.postMessage(command);
  }

  onLine(line: string) {
    if (typeof line !== "string" || !this.pending) return;
    const best = parseBestMove(line);
    if (best !== undefined) {
      const { onBest } = this.pending;
      this.pending = null;
      onBest(best);
      return;
    }
    this.pending.onInfo(line);
  }

  private enqueue<T>(run: () => Promise<T>): Promise<T> {
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  private setMultiPv(value: number) {
    if (value === this.multipv) return;
    this.multipv = value;
    this.send(`setoption name MultiPV value ${value}`);
  }

  // Analisa uma posição por tempo. As análises entram em fila: uma de cada vez.
  analyse(fen: string, movetimeMs: number): Promise<Analysis> {
    return this.enqueue(async () => {
      await this.ready;
      this.setMultiPv(1);
      return new Promise<Analysis>((resolve, reject) => {
        let last: { score: Score | null; depth: number } = {
          score: null,
          depth: 0,
        };
        this.pending = {
          onInfo: (line) => {
            const info = parseInfo(line);
            if (info && info.multipv === 1)
              last = { score: info.score, depth: info.depth };
          },
          onBest: (bestMove) =>
            resolve({ bestMove, score: last.score, depth: last.depth }),
          reject,
        };
        this.send(`position fen ${fen}`);
        this.send(`go movetime ${Math.round(movetimeMs)}`);
      });
    });
  }

  // Analisa até uma profundidade, com várias linhas. onDepth avisa a cada
  // profundidade concluída da melhor linha. Se o sinal for abortado, o motor
  // para e a resposta volta com o que já foi calculado (cancelled = true).
  analyseDepth(
    fen: string,
    options: {
      depth: number;
      multipv?: number;
      signal?: AbortSignal;
      onDepth?: (depth: number) => void;
    },
  ): Promise<DepthAnalysis> {
    return this.enqueue(async () => {
      await this.ready;
      const multipv = Math.max(1, Math.min(5, options.multipv ?? 1));
      this.setMultiPv(multipv);
      return new Promise<DepthAnalysis>((resolve, reject) => {
        const lines = new Map<number, EngineLine>();
        let depth = 0;
        let cancelled = false;
        const onAbort = () => {
          cancelled = true;
          this.send("stop");
        };
        if (options.signal?.aborted) cancelled = true;
        options.signal?.addEventListener("abort", onAbort, { once: true });
        this.pending = {
          onInfo: (line) => {
            const info = parseInfo(line);
            if (!info || info.pv.length === 0) return;
            lines.set(info.multipv, {
              move: info.pv[0],
              score: info.score,
              pv: info.pv,
            });
            if (info.multipv === 1 && info.depth > depth) {
              depth = info.depth;
              options.onDepth?.(depth);
            }
          },
          onBest: () => {
            options.signal?.removeEventListener("abort", onAbort);
            const sorted = [...lines.entries()]
              .sort(([a], [b]) => a - b)
              .map(([, line]) => line);
            resolve({ lines: sorted, depth, cancelled });
          },
          reject: (error) => {
            options.signal?.removeEventListener("abort", onAbort);
            reject(error);
          },
        };
        this.send(`position fen ${fen}`);
        // Já cancelado antes de começar: pede só um lance rápido.
        this.send(cancelled ? "go depth 1" : `go depth ${options.depth}`);
      });
    });
  }

  // Zera a memória do motor (tabela hash): mesma partida, mesmo resultado.
  // Entra na fila, para não cair no meio de uma análise.
  newGame() {
    void this.enqueue(async () => {
      await this.ready;
      this.send("ucinewgame");
    });
  }

  terminate() {
    this.pending?.reject(new Error("Motor encerrado."));
    this.pending = null;
    this.worker.terminate();
  }
}

export function engineSupported(): boolean {
  return typeof Worker !== "undefined" && typeof WebAssembly !== "undefined";
}
