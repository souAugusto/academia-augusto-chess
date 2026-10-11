"use client";

import { parseBestMove, parseInfo, type Score } from "./uci";

// Cliente do Stockfish no navegador. O motor (GPL) roda como programa separado,
// num Web Worker servido de /engine/, e só troca mensagens UCI com o site.
const ENGINE_URL = "/engine/stockfish-19-lite-single.js";

export type Analysis = {
  bestMove: string | null;
  score: Score | null;
  depth: number;
};

type Pending = {
  resolve: (analysis: Analysis) => void;
  reject: (error: Error) => void;
  last: { score: Score | null; depth: number };
};

export class StockfishClient {
  worker: Worker;
  ready: Promise<void>;
  pending: Pending | null = null;
  queue: Promise<unknown> = Promise.resolve();

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
    this.send("setoption name Hash value 16");
    this.send("isready");
  }

  send(command: string) {
    this.worker.postMessage(command);
  }

  onLine(line: string) {
    if (typeof line !== "string" || !this.pending) return;
    const info = parseInfo(line);
    if (info) {
      this.pending.last = { score: info.score, depth: info.depth };
      return;
    }
    const best = parseBestMove(line);
    if (best !== undefined) {
      const { resolve, last } = this.pending;
      this.pending = null;
      resolve({ bestMove: best, score: last.score, depth: last.depth });
    }
  }

  // Analisa uma posição. As análises entram em fila: uma de cada vez.
  analyse(fen: string, movetimeMs: number): Promise<Analysis> {
    const run = async () => {
      await this.ready;
      return new Promise<Analysis>((resolve, reject) => {
        this.pending = { resolve, reject, last: { score: null, depth: 0 } };
        this.send(`position fen ${fen}`);
        this.send(`go movetime ${Math.round(movetimeMs)}`);
      });
    };
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  newGame() {
    this.send("ucinewgame");
    this.send("isready");
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
