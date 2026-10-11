"use client";

import { Chess, type Square } from "chess.js";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Arrow } from "react-chessboard";
import { recordEndgameAttempt } from "@/app/(app)/finais/actions";
import { MoveInput } from "@/components/chess/MoveInput";
import {
  BOARD_COLORS,
  PlayBoard,
  type Side,
} from "@/components/chess/PlayBoard";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { engineSupported, StockfishClient } from "@/lib/engine/client";
import { formatScore, scoreFor, scoreToCp, type Score } from "@/lib/engine/uci";
import {
  classifyMove,
  endgameStatus,
  GOAL_LABELS,
  QUALITY_LABELS,
  type EndgameStatus,
  type Goal,
  type MoveQuality,
} from "@/lib/endgames";

type EndgameTrainerProps = {
  endgameId: string;
  fen: string;
  userColor: "white" | "black";
  goal: Goal;
  maxMoves: number;
};

// Tempo de análise por lance (curto para funcionar bem no celular).
const ENGINE_MOVETIME = 700;
const USER_ANALYSIS_MOVETIME = 500;

function toMove(uci: string) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

export function EndgameTrainer({
  endgameId,
  fen: startFen,
  userColor,
  goal,
  maxMoves,
}: EndgameTrainerProps) {
  const userSide: Side = userColor === "white" ? "w" : "b";
  const chess = useRef(new Chess(startFen));
  const engine = useRef<StockfishClient | null>(null);
  const before = useRef<number | null>(null); // avaliação (do aluno) antes do lance dele
  const bestForUser = useRef<string | null>(null);
  const generation = useRef(0); // invalida análises antigas ao recomeçar
  const recorded = useRef(false);

  const [fen, setFen] = useState(startFen);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );
  const [userMoves, setUserMoves] = useState(0);
  const [status, setStatus] = useState<EndgameStatus>({ kind: "playing" });
  const [thinking, setThinking] = useState(false);
  const [quality, setQuality] = useState<MoveQuality | null>(null);
  const [score, setScore] = useState<Score | null>(null); // perspectiva das brancas
  const [hint, setHint] = useState<Arrow | null>(null);
  const [engineState, setEngineState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  // De quem é a vez vem da FEN (estado), não do ref: refs não são lidos durante a renderização.
  const userTurn =
    status.kind === "playing" && !thinking && fen.split(" ")[1] === userSide;

  function checkStatus(movesSoFar: number): EndgameStatus {
    const game = chess.current;
    const next = endgameStatus(
      {
        isCheckmate: game.isCheckmate(),
        isDraw: game.isDraw(),
        turn: game.turn(),
      },
      userSide,
      goal,
      movesSoFar,
      maxMoves,
    );
    setStatus(next);
    if (next.kind !== "playing" && !recorded.current) {
      recorded.current = true;
      void recordEndgameAttempt({
        endgameId,
        success: next.kind === "success",
        moves: movesSoFar,
      });
    }
    return next;
  }

  // Avalia a posição na vez do aluno: guarda a avaliação "antes" e o melhor lance (dica).
  async function analyseUserTurn(run: number) {
    const client = engine.current;
    if (!client) return;
    const position = chess.current.fen();
    const analysis = await client.analyse(position, USER_ANALYSIS_MOVETIME);
    if (run !== generation.current || !analysis.score) return;
    before.current = scoreToCp(
      scoreFor(analysis.score, chess.current.turn(), userSide),
    );
    bestForUser.current = analysis.bestMove;
    setScore(scoreFor(analysis.score, chess.current.turn(), "w"));
  }

  // Vez do motor: classifica o lance do aluno (se houve) e joga a resposta.
  async function engineTurn(run: number, movesSoFar: number, judge: boolean) {
    const client = engine.current;
    if (!client) return;
    setThinking(true);
    const analysis = await client.analyse(chess.current.fen(), ENGINE_MOVETIME);
    if (run !== generation.current) return;
    const engineSide = chess.current.turn();
    if (analysis.score) {
      setScore(scoreFor(analysis.score, engineSide, "w"));
      if (judge && before.current !== null) {
        const after = scoreToCp(scoreFor(analysis.score, engineSide, userSide));
        setQuality(classifyMove(before.current, after));
      }
    }
    if (analysis.bestMove) {
      const move = chess.current.move(toMove(analysis.bestMove));
      setFen(chess.current.fen());
      setLastMove({ from: move.from, to: move.to });
    }
    setThinking(false);
    if (checkStatus(movesSoFar).kind === "playing") void analyseUserTurn(run);
  }

  function start() {
    generation.current += 1;
    const run = generation.current;
    chess.current = new Chess(startFen);
    recorded.current = false;
    before.current = null;
    bestForUser.current = null;
    setFen(startFen);
    setLastMove(null);
    setUserMoves(0);
    setStatus({ kind: "playing" });
    setQuality(null);
    setHint(null);
    setMessage("");
    setThinking(false);
    engine.current?.newGame();
    if (chess.current.turn() === userSide) void analyseUserTurn(run);
    else void engineTurn(run, 0, false);
  }

  // Liga o motor ao abrir a página e desliga ao sair.
  useEffect(() => {
    if (!engineSupported()) {
      // Avisa no próximo ciclo para não mudar o estado dentro do efeito.
      void Promise.resolve().then(() => setEngineState("error"));
      return;
    }
    const client = new StockfishClient();
    engine.current = client;
    client.ready.then(
      () => {
        setEngineState("ready");
        start();
      },
      () => setEngineState("error"),
    );
    return () => {
      generation.current += 1;
      client.terminate();
      engine.current = null;
    };
    // O motor é criado uma vez por página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onMove(from: Square, to: Square, promotion?: string) {
    if (!userTurn) return false;
    try {
      const move = chess.current.move({ from, to, promotion });
      setLastMove({ from: move.from, to: move.to });
    } catch {
      return false;
    }
    const moves = userMoves + 1;
    setUserMoves(moves);
    setFen(chess.current.fen());
    setHint(null);
    setMessage("");
    if (checkStatus(moves).kind === "playing")
      void engineTurn(generation.current, moves, true);
    return true;
  }

  function showHint() {
    if (!userTurn || !bestForUser.current) return;
    const move = toMove(bestForUser.current);
    setHint({
      startSquare: move.from,
      endSquare: move.to,
      color: BOARD_COLORS.arrow,
    });
  }

  if (engineState === "error") {
    return (
      <Card>
        <p className="leading-relaxed text-muted">
          Não foi possível carregar o motor de xadrez neste navegador. Tente
          atualizar o navegador ou usar outro aparelho.
        </p>
      </Card>
    );
  }

  const statusText =
    engineState === "loading"
      ? "Carregando o motor..."
      : status.kind !== "playing"
        ? status.reason
        : thinking
          ? "O computador está pensando..."
          : message || "Sua vez.";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4">
        <PlayBoard
          id="finale-final"
          fen={fen}
          orientation={userSide}
          movableColor={userTurn ? userSide : null}
          lastMove={lastMove}
          arrows={hint ? [hint] : []}
          onMove={onMove}
        />
        <MoveInput
          fen={fen}
          disabled={!userTurn}
          onMove={onMove}
          onInvalid={setMessage}
        />
      </div>

      <aside className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-accent-text">
              {GOAL_LABELS[goal]}
            </span>
            <span className="text-sm text-muted tabular-nums">
              {userMoves} de {maxMoves} lances
            </span>
          </div>
          <p
            aria-live="polite"
            className={`min-h-6 font-medium ${
              status.kind === "success"
                ? "text-success"
                : status.kind === "fail"
                  ? "text-danger"
                  : "text-text"
            }`}
          >
            {statusText}
          </p>
          {quality && status.kind === "playing" && (
            <p
              className={`text-sm ${quality === "bom" ? "text-success" : quality === "imprecisao" ? "text-accent-text" : "text-danger"}`}
            >
              Seu último lance: {QUALITY_LABELS[quality]}
            </p>
          )}
          {score && (
            <p className="text-sm text-muted">
              Avaliação (brancas):{" "}
              <span className="font-mono tabular-nums">
                {formatScore(score)}
              </span>
            </p>
          )}
        </Card>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={showHint}
            disabled={!userTurn}
            className={buttonClasses("secondary")}
          >
            Dica
          </button>
          <button
            type="button"
            onClick={start}
            disabled={engineState !== "ready"}
            className={buttonClasses(
              status.kind === "playing" ? "secondary" : "primary",
            )}
          >
            Recomeçar
          </button>
          {status.kind !== "playing" && (
            <Link href="/finais" className={buttonClasses("ghost")}>
              Outros finais
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
