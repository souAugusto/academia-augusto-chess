// Stockfish (pacote npm "stockfish", lite single-thread) rodando no Node, só para
// scripts locais. Uma análise por vez; comandos sempre adiados (o motor não é
// reentrante dentro do próprio listener).
import { createRequire } from "node:module";
import type { EngineScore } from "../src/lib/analysis/winprob.ts";

const require = createRequire(import.meta.url);

type RawEngine = { processCommand(command: string): void; terminate?(): void };

export type Line = { move: string; score: EngineScore; pv: string[] };

export class NodeEngine {
  private engine: RawEngine;
  private lines = new Map<number, Line>();
  private done: ((lines: Line[]) => void) | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor() {
    const init = require("stockfish") as (
      path: string,
      onMessage: (line: string) => void,
    ) => RawEngine;
    this.engine = init("lite-single", (line) => this.onLine(line));
    this.send("uci");
    this.send("setoption name Hash value 64");
  }

  private send(command: string) {
    setTimeout(() => this.engine.processCommand(command), 0);
  }

  private onLine(line: string) {
    if (!this.done) return;
    if (line.startsWith("info ") && / pv /.test(line) && / score /.test(line)) {
      if (/ (lowerbound|upperbound) /.test(line)) return;
      const multipv = Number(/ multipv (\d+)/.exec(line)?.[1] ?? 1);
      const score = / score (cp|mate) (-?\d+)/.exec(line)!;
      const pv = line.split(" pv ")[1].trim().split(/\s+/);
      this.lines.set(multipv, {
        move: pv[0],
        score: { kind: score[1] as "cp" | "mate", value: Number(score[2]) },
        pv,
      });
      return;
    }
    if (line.startsWith("bestmove")) {
      const resolve = this.done;
      this.done = null;
      resolve(
        [...this.lines.entries()].sort((a, b) => a[0] - b[0]).map(([, l]) => l),
      );
    }
  }

  // Analisa a posição. `searchmoves` limita a busca a esses lances (UCI).
  analyse(
    fen: string,
    options: {
      depth: number;
      multipv?: number;
      searchmoves?: string[];
      maxMs?: number;
    },
  ): Promise<Line[]> {
    const run = () =>
      new Promise<Line[]>((resolve) => {
        this.lines = new Map();
        this.done = resolve;
        this.send(`setoption name MultiPV value ${options.multipv ?? 1}`);
        this.send(`position fen ${fen}`);
        const moves = options.searchmoves?.length
          ? ` searchmoves ${options.searchmoves.join(" ")}`
          : "";
        this.send(`go depth ${options.depth}${moves}`);
        const timer = setTimeout(
          () => this.send("stop"),
          options.maxMs ?? 8000,
        );
        const original = this.done;
        this.done = (lines) => {
          clearTimeout(timer);
          original(lines);
        };
      });
    const result = this.queue.then(run, run);
    this.queue = result.catch(() => undefined);
    return result;
  }

  quit() {
    this.engine.terminate?.();
  }
}
