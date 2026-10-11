"use client";

import { Chess, type Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Arrow } from "react-chessboard";
import { recordLineResult } from "@/app/(app)/aberturas/actions";
import { MoveInput } from "@/components/chess/MoveInput";
import {
  BOARD_COLORS,
  PlayBoard,
  type Side,
} from "@/components/chess/PlayBoard";
import { useReducedMotion } from "@/components/chess/useReducedMotion";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import type { ProgressEntry } from "@/lib/data/repertoires";
import {
  buildTree,
  childrenOf,
  fenAfter,
  judgeTrainingMove,
  listLines,
  pathTo,
  pickLine,
  type LineProgress,
  type RepertoireNode,
} from "@/lib/openings/tree";
import { sanToPortuguese } from "@/lib/chess/notation";

type RepertoireTrainerProps = {
  repertoireId: string;
  color: "white" | "black";
  nodes: RepertoireNode[];
  openingNames: Record<string, string>;
  progress: ProgressEntry[];
};

type Mode = "estudar" | "treinar";

const REPLY_DELAY = 500;
const now = () => Date.now();

function arrowOf(node: RepertoireNode, color: string): Arrow {
  return {
    startSquare: node.uci.slice(0, 2),
    endSquare: node.uci.slice(2, 4),
    color,
  };
}

function moveLabel(path: RepertoireNode[]) {
  return path
    .map((node, index) =>
      index % 2 === 0
        ? `${index / 2 + 1}. ${sanToPortuguese(node.san)}`
        : sanToPortuguese(node.san),
    )
    .join(" ");
}

export function RepertoireTrainer({
  repertoireId,
  color,
  nodes,
  openingNames,
  progress,
}: RepertoireTrainerProps) {
  const [mode, setMode] = useState<Mode>("estudar");
  const tree = useMemo(() => buildTree(nodes), [nodes]);
  const userSide: Side = color === "white" ? "w" : "b";

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Modo"
        className="flex w-full max-w-sm gap-1 rounded-control bg-surface-2 p-1"
      >
        {(["estudar", "treinar"] as const).map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={mode === item}
            onClick={() => setMode(item)}
            className={`min-h-touch flex-1 rounded-[0.6rem] text-sm font-semibold capitalize transition ${
              mode === item
                ? "bg-accent text-on-accent"
                : "text-muted hover:text-text"
            }`}
          >
            {item === "estudar" ? "Estudar" : "Treinar"}
          </button>
        ))}
      </div>
      {nodes.length === 0 ? (
        <p className="text-muted">Este repertório ainda não tem lances.</p>
      ) : mode === "estudar" ? (
        <StudyMode
          tree={tree}
          userSide={userSide}
          openingNames={openingNames}
        />
      ) : (
        <TrainMode
          tree={tree}
          userSide={userSide}
          repertoireId={repertoireId}
          openingNames={openingNames}
          initialProgress={progress}
        />
      )}
    </div>
  );
}

function StudyMode({
  tree,
  userSide,
  openingNames,
}: {
  tree: ReturnType<typeof buildTree>;
  userSide: Side;
  openingNames: Record<string, string>;
}) {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const path = pathTo(tree, currentId);
  const fen = fenAfter(path);
  const current = currentId ? tree.nodes.get(currentId) : undefined;
  const next = childrenOf(tree, currentId);
  const turn = new Chess(fen).turn();

  function go(node: RepertoireNode | null) {
    setCurrentId(node?.id ?? null);
    setMessage("");
  }

  function onMove(from: Square, to: Square, promotion?: string) {
    const uci = `${from}${to}${promotion ?? ""}`;
    const child = next.find((node) => node.uci === uci);
    if (child) {
      go(child);
      return true;
    }
    setMessage(
      "Esse lance não está no repertório. As setas mostram as continuações.",
    );
    return false;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4">
        <PlayBoard
          id="finale-repertorio-estudo"
          fen={fen}
          orientation={userSide}
          movableColor={next.length > 0 ? turn : null}
          lastMove={
            current
              ? { from: current.uci.slice(0, 2), to: current.uci.slice(2, 4) }
              : null
          }
          arrows={next.map((node, index) =>
            arrowOf(
              node,
              index === 0 ? BOARD_COLORS.arrow : BOARD_COLORS.arrowAlt,
            ),
          )}
          onMove={onMove}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => go(null)}
            disabled={!current}
            className={buttonClasses("secondary")}
          >
            Início
          </button>
          <button
            type="button"
            onClick={() =>
              go(
                current?.parentId
                  ? (tree.nodes.get(current.parentId) ?? null)
                  : null,
              )
            }
            disabled={!current}
            className={buttonClasses("secondary")}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => go(next[0] ?? null)}
            disabled={next.length === 0}
            className={buttonClasses("secondary")}
          >
            Avançar
          </button>
        </div>
        <p aria-live="polite" className="min-h-6 text-sm text-danger">
          {message}
        </p>
      </div>

      <aside className="flex flex-col gap-4">
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-label text-accent-text uppercase">
            {current
              ? (openingNames[current.id] ?? "Posição do repertório")
              : "Posição inicial"}
          </span>
          <p className="font-mono text-sm text-muted">
            {path.length ? moveLabel(path) : "Escolha o primeiro lance."}
          </p>
          {current?.comment && (
            <p className="leading-relaxed">{current.comment}</p>
          )}
        </Card>
        {next.length > 0 && (
          <Card className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Continuações</h2>
            <ul className="flex flex-col gap-2">
              {next.map((node, index) => (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => go(node)}
                    className="flex min-h-touch w-full items-center gap-3 rounded-control border border-border px-3 text-left hover:bg-surface-2"
                  >
                    <span className="font-mono font-semibold">
                      {sanToPortuguese(node.san)}
                    </span>
                    {index === 0 && (
                      <span className="text-xs text-accent-text">
                        principal
                      </span>
                    )}
                    {node.comment && (
                      <span className="truncate text-sm text-muted">
                        {node.comment}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </aside>
    </div>
  );
}

function TrainMode({
  tree,
  userSide,
  repertoireId,
  openingNames,
  initialProgress,
}: {
  tree: ReturnType<typeof buildTree>;
  userSide: Side;
  repertoireId: string;
  openingNames: Record<string, string>;
  initialProgress: ProgressEntry[];
}) {
  const lines = useMemo(() => listLines(tree), [tree]);
  const [progress, setProgress] = useState(
    () =>
      new Map<string, LineProgress>(
        initialProgress.map((entry) => [entry.leafId, entry]),
      ),
  );
  const [line, setLine] = useState(() => pickLine(lines, progress));
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState<{
    tone: "ok" | "bad" | "info";
    text: string;
  } | null>(null);
  const [hintArrow, setHintArrow] = useState<Arrow | null>(null);
  const [saved, setSaved] = useState(false);
  const reducedMotion = useReducedMotion();
  const timer = useRef<number | null>(null);

  const done = line !== null && index >= line.length;
  const path = line ? line.slice(0, index) : [];
  const fen = fenAfter(path);
  const sideToMove = new Chess(fen).turn();
  const userTurn = !done && sideToMove === userSide;
  const last = path.at(-1);

  // Fim da linha: grava o resultado uma vez e atualiza o progresso local.
  function finish(leafId: string, errors: number) {
    if (saved) return;
    setSaved(true);
    void recordLineResult({ repertoireId, leafId, mistakes: errors });
    setProgress((current) => {
      const next = new Map(current);
      const stats = next.get(leafId) ?? {
        correct: 0,
        mistakes: 0,
        lastTrainedAt: 0,
      };
      next.set(leafId, {
        correct: stats.correct + (errors === 0 ? 1 : 0),
        mistakes: stats.mistakes + (errors > 0 ? 1 : 0),
        lastTrainedAt: now(),
      });
      return next;
    });
  }

  function advance(nextIndex: number) {
    if (!line) return;
    setIndex(nextIndex);
    if (nextIndex >= line.length) finish(line.at(-1)!.id, mistakes);
  }

  // Lances do adversário: o app joga sozinho, seguindo a linha.
  useEffect(() => {
    if (!line || done || userTurn) return;
    timer.current = window.setTimeout(
      () => advance(index + 1),
      reducedMotion ? 0 : REPLY_DELAY,
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  });

  function onMove(from: Square, to: Square, promotion?: string) {
    if (!line || !userTurn) return false;
    const uci = `${from}${to}${promotion ?? ""}`;
    const verdict = judgeTrainingMove(tree, line, index, uci);
    if (verdict.kind === "correct") {
      const node = line[index];
      advance(index + 1);
      setHintArrow(null);
      setFeedback({ tone: "ok", text: node.comment ?? "Correto." });
      return true;
    }
    setHintArrow(arrowOf(verdict.expected, BOARD_COLORS.arrow));
    if (verdict.kind === "alternative") {
      setFeedback({
        tone: "info",
        text: `Esse lance também está no repertório, mas nesta linha o lance é ${sanToPortuguese(verdict.expected.san)}.`,
      });
    } else {
      setMistakes((value) => value + 1);
      setFeedback({
        tone: "bad",
        text: `No seu repertório, o lance aqui é ${sanToPortuguese(verdict.expected.san)}.`,
      });
    }
    return false;
  }

  function nextLine() {
    setLine(pickLine(lines, progress, line?.at(-1)?.id));
    setIndex(0);
    setMistakes(0);
    setFeedback(null);
    setHintArrow(null);
    setSaved(false);
  }

  if (!line)
    return <p className="text-muted">Este repertório ainda não tem linhas.</p>;
  const trained = lines.filter((item) => progress.has(item.at(-1)!.id)).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4">
        <PlayBoard
          id="finale-repertorio-treino"
          fen={fen}
          orientation={userSide}
          movableColor={userTurn ? userSide : null}
          lastMove={
            last
              ? { from: last.uci.slice(0, 2), to: last.uci.slice(2, 4) }
              : null
          }
          arrows={hintArrow ? [hintArrow] : []}
          onMove={onMove}
        />
        <MoveInput
          fen={fen}
          disabled={!userTurn}
          onMove={onMove}
          onInvalid={(text) => setFeedback({ tone: "bad", text })}
        />
      </div>

      <aside className="flex flex-col gap-4">
        <Card className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-label text-accent-text uppercase">
            {last
              ? (openingNames[last.id] ?? "Treino da linha")
              : "Treino da linha"}
          </span>
          <p className="font-mono text-sm text-muted">
            {path.length ? moveLabel(path) : "Início da linha."}
          </p>
          <p
            aria-live="polite"
            className={`min-h-6 leading-relaxed ${
              feedback?.tone === "bad"
                ? "text-danger"
                : feedback?.tone === "ok"
                  ? "text-success"
                  : "text-text"
            }`}
          >
            {done
              ? mistakes === 0
                ? "Linha concluída sem erros."
                : `Linha concluída com ${mistakes} ${mistakes === 1 ? "erro" : "erros"}.`
              : (feedback?.text ??
                (userTurn
                  ? "Sua vez: jogue o lance do repertório."
                  : "O adversário está jogando..."))}
          </p>
          {done && (
            <button
              type="button"
              onClick={nextLine}
              className={buttonClasses("primary", "md", "mt-2")}
            >
              Próxima linha
            </button>
          )}
        </Card>
        <p className="text-sm text-muted">
          {trained} de {lines.length} linhas já treinadas.
        </p>
      </aside>
    </div>
  );
}
