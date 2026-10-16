"use client";

import { Chess, type Square } from "chess.js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveAsTactic } from "@/app/(app)/analise/actions";
import { BoardStage } from "@/components/chess/BoardStage";
import {
  BOARD_COLORS,
  ChessBoard,
  type Side,
} from "@/components/chess/ChessBoard";
import { useReducedMotion } from "@/components/chess/useReducedMotion";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { CLASS_LABELS, type MoveClass } from "@/lib/analysis/classify";
import { commentFor, moveToSan } from "@/lib/analysis/comments";
import type { AnalysisData } from "@/lib/analysis/compact";
import type { ParsedGame } from "@/lib/analysis/pgn";
import { ANALYSIS_PROFILE } from "@/lib/analysis/profile";
import { buildReport } from "@/lib/analysis/report";
import { suggestLessons, type LessonIndexEntry } from "@/lib/analysis/suggest";
import type { OpeningBook } from "@/lib/analysis/theory";
import { formatEval, winChance } from "@/lib/analysis/winprob";
import { sanToPortuguese } from "@/lib/chess/notation";
import { StockfishClient } from "@/lib/engine/client";
import { DeepBadge } from "./DeepBadge";
import { EvalBar } from "./EvalBar";
import { EvalGraph, type GraphMark } from "./EvalGraph";
import { MoveClassIcon } from "./MoveClassIcon";
import { MoveList } from "./MoveList";
import { PlayerSummary } from "./PlayerSummary";

export type Loaded = {
  game: ParsedGame;
  title: string;
  importedGameId: number | null;
};

const RETRY_CLASSES: MoveClass[] = [
  "imprecisao",
  "erro",
  "chance_perdida",
  "erro_grave",
];
const TACTIC_CLASSES: MoveClass[] = ["erro", "chance_perdida", "erro_grave"];
const RETRY_LOSS = 5; // perda máxima para o lance do "Tente de novo" valer

const plyLabel = (ply: number, san: string) =>
  `${Math.floor(ply / 2) + 1}${ply % 2 === 0 ? "." : "..."}${sanToPortuguese(san)}`;

type Retry = {
  ply: number;
  tries: number;
  message: string | null;
  done: boolean;
  solved: boolean;
  showSolution: boolean;
};

export function AnalysisView({
  loaded,
  data,
  book,
  analysing,
  initialOrientation,
  lessons,
  completed,
  userColor,
  canSaveTactic,
  savedNote,
}: {
  loaded: Loaded;
  data: AnalysisData;
  book: OpeningBook | null;
  analysing: boolean;
  initialOrientation: Side;
  lessons: LessonIndexEntry[];
  completed: string[];
  userColor: Side | null;
  canSaveTactic: boolean;
  savedNote: string | null;
}) {
  const { game } = loaded;
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const report = useMemo(
    () => buildReport(data, game.fens, book),
    [data, game.fens, book],
  );
  const { reviewed } = report;
  const lastIndex = Math.max(0, data.evals.length - 1);
  const [index, setIndex] = useState(0);
  const [orientation, setOrientation] = useState<Side>(initialOrientation);
  const [showBest, setShowBest] = useState(true);
  const [tab, setTab] = useState<"lances" | "resumo">("lances");
  const [retry, setRetry] = useState<Retry | null>(null);
  const [checking, setChecking] = useState(false);
  const [savingTactic, setSavingTactic] = useState(false);
  const retryEngine = useRef<StockfishClient | null>(null);

  // O "Tente de novo" usa um motor separado: a análise principal continua
  // igual (determinística) mesmo se o aluno testar lances durante ela.
  useEffect(() => () => retryEngine.current?.terminate(), []);

  const go = useCallback(
    (value: number | ((current: number) => number)) => {
      setRetry(null);
      setIndex((current) => {
        const next = typeof value === "function" ? value(current) : value;
        return Math.max(0, Math.min(lastIndex, next));
      });
    },
    [lastIndex],
  );

  const moments = report.moments;
  const nextMoment = useCallback(() => {
    if (moments.length === 0) return;
    const after = moments.find((m) => m.ply + 1 > index) ?? moments[0];
    go(after.ply + 1);
  }, [moments, index, go]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (event.key === "ArrowRight") go((v) => v + 1);
      else if (event.key === "ArrowLeft") go((v) => v - 1);
      else if (event.key === "Home") go(0);
      else if (event.key === "End") go(lastIndex);
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastIndex, go]);

  const suggestions = useMemo(
    () =>
      analysing
        ? []
        : suggestLessons({
            moves: game.ucis,
            fens: game.fens,
            reviewed,
            lessons,
            userColor,
            completed: new Set(completed),
          }),
    [analysing, game, reviewed, lessons, userColor, completed],
  );

  const moveReview = index > 0 ? reviewed[index - 1] : undefined;
  const fen = retry ? game.fens[retry.ply] : game.fens[index];
  const turn = fen.split(" ")[1] === "b" ? "b" : "w";
  const lastUci = !retry && index > 0 ? game.ucis[index - 1] : null;

  // Seta do melhor lance: quando o lance jogado não foi o melhor (ou, no
  // "Tente de novo", quando o aluno pede a solução).
  const arrowMove = retry
    ? retry.showSolution
      ? reviewed[retry.ply]?.best
      : null
    : showBest &&
        moveReview &&
        moveReview.best &&
        moveReview.best !== moveReview.played &&
        moveReview.cls !== "teoria"
      ? moveReview.best
      : null;
  const arrows = arrowMove
    ? [
        {
          startSquare: arrowMove.slice(0, 2),
          endSquare: arrowMove.slice(2, 4),
          color: BOARD_COLORS.arrow,
        },
      ]
    : [];
  const highlights: Record<string, React.CSSProperties> = {};
  if (lastUci && moveReview?.cls === "brilhante")
    highlights[lastUci.slice(2, 4)] = reducedMotion
      ? { boxShadow: "inset 0 0 0 3px rgb(20 184 166 / 0.7)" }
      : { animation: "brilho-lance 1.4s ease-in-out 2" };

  async function tryMove(from: Square, to: Square, promotion?: string) {
    if (!retry || retry.done) return;
    const chess = new Chess(game.fens[retry.ply]);
    let san: string;
    try {
      san = chess.move({ from, to, promotion: promotion ?? "q" }).san;
    } catch {
      return;
    }
    const target = reviewed[retry.ply];
    if (!target) return;
    setChecking(true);
    let after: number;
    if (chess.isCheckmate()) after = 100;
    else if (chess.isDraw()) after = 50;
    else {
      retryEngine.current ??= new StockfishClient();
      const result = await retryEngine.current.analyseDepth(chess.fen(), {
        depth: ANALYSIS_PROFILE.retryDepth,
      });
      const line = result.lines[0];
      // O motor avalia do ponto de vista de quem joga agora (o adversário).
      after = line ? 100 - winChance(line.score) : 50;
    }
    setChecking(false);
    const loss = Math.max(0, target.before - after);
    const tries = retry.tries + 1;
    if (loss < RETRY_LOSS)
      setRetry({
        ...retry,
        tries,
        done: true,
        solved: true,
        message: `Muito bem! ${sanToPortuguese(san)} mantém a posição.`,
      });
    else
      setRetry({
        ...retry,
        tries,
        message: `${sanToPortuguese(san)} também não é bom. Tente outro lance ou veja a solução.`,
      });
  }

  async function saveTactic(ply: number) {
    const line = data.pv[ply];
    if (!line || line.length === 0) return;
    setSavingTactic(true);
    const result = await saveAsTactic({ fen: game.fens[ply], line: line.slice(0, 5) });
    setSavingTactic(false);
    toast(
      result.ok ? "sucesso" : "erro",
      result.ok
        ? "Tática salva no conjunto Meus erros."
        : result.message,
    );
  }

  const names = {
    w: game.headers.White ?? "Brancas",
    b: game.headers.Black ?? "Pretas",
  };
  const result = game.headers.Result && game.headers.Result !== "*" ? game.headers.Result : null;
  const marks: GraphMark[] = [
    ...moments.map((m): GraphMark => ({ index: m.ply + 1, cls: "momento" })),
    ...reviewed
      .filter((m) => m.cls === "brilhante" || m.cls === "erro_grave")
      .map((m): GraphMark => ({ index: m.ply + 1, cls: m.cls })),
  ];
  const currentEval = data.evals[index];
  const comment = moveReview
    ? commentFor(moveReview, {
        fens: game.fens,
        pv: data.pv,
        deep: data.deep,
        evals: data.evals,
        opening: report.opening,
      })
    : report.opening
      ? `Abertura: ${report.opening}.`
      : "Posição inicial. Use as setas para percorrer a partida.";
  const outOfBook =
    report.bookPlies > 0 && index === report.bookPlies + 1 && moveReview
      ? " A partida sai da teoria neste lance."
      : "";

  const info = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-lg font-semibold">
          Revisão da partida
        </h2>
        <DeepBadge />
      </div>
      <p className="text-sm text-muted">
        <span className="font-semibold text-text">{names.w}</span> x{" "}
        <span className="font-semibold text-text">{names.b}</span>
        {result && ` · ${result}`}
        {currentEval && (
          <span className="sm:hidden"> · avaliação {formatEval(currentEval)}</span>
        )}
        {savedNote && <span> · {savedNote}</span>}
      </p>
    </div>
  );

  const retryPanel = retry && (
    <div className="flex flex-col gap-2 rounded-control border border-border bg-surface-2 p-3">
      <p className="font-semibold">Tente de novo</p>
      <p className="text-[0.9375rem] leading-relaxed">
        Na partida foi jogado {plyLabel(retry.ply, game.sans[retry.ply])}.
        Encontre um lance melhor para as {turn === "w" ? "brancas" : "pretas"}.
      </p>
      {checking && (
        <p className="text-sm text-muted">Conferindo com o motor...</p>
      )}
      {retry.message && (
        <p
          role="status"
          className={retry.solved ? "font-semibold text-success" : "text-[0.9375rem]"}
        >
          {retry.message}
        </p>
      )}
      {retry.showSolution && reviewed[retry.ply]?.best && (
        <p className="text-[0.9375rem]">
          Solução:{" "}
          <span className="font-semibold">
            {moveToSan(game.fens[retry.ply], reviewed[retry.ply].best)}
          </span>{" "}
          (seta no tabuleiro).
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {!retry.solved && !retry.showSolution && (
          <button
            type="button"
            className={buttonClasses("secondary")}
            onClick={() => setRetry({ ...retry, showSolution: true, done: true })}
          >
            Ver solução
          </button>
        )}
        <button
          type="button"
          className={buttonClasses("ghost")}
          onClick={() => setRetry(null)}
        >
          Voltar à análise
        </button>
      </div>
    </div>
  );

  const commentCard = (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-start gap-2">
        {moveReview && <MoveClassIcon cls={moveReview.cls} size={22} />}
        <div className="flex min-w-0 flex-col gap-1">
          {moveReview && (
            <p className="text-sm font-semibold">
              {plyLabel(moveReview.ply, game.sans[moveReview.ply])}{" "}
              <span className="text-muted">· {CLASS_LABELS[moveReview.cls]}</span>
            </p>
          )}
          <p className="text-sm leading-relaxed">
            {comment}
            {outOfBook}
          </p>
        </div>
      </div>
      {moveReview && !analysing && (
        <div className="flex flex-wrap gap-2">
          {RETRY_CLASSES.includes(moveReview.cls) && (
            <button
              type="button"
              className={buttonClasses("outline-accent")}
              onClick={() =>
                setRetry({
                  ply: moveReview.ply,
                  tries: 0,
                  message: null,
                  done: false,
                  solved: false,
                  showSolution: false,
                })
              }
            >
              Tente de novo
            </button>
          )}
          {TACTIC_CLASSES.includes(moveReview.cls) &&
            (canSaveTactic ? (
              <button
                type="button"
                className={buttonClasses("secondary")}
                disabled={savingTactic}
                onClick={() => void saveTactic(moveReview.ply)}
              >
                {savingTactic ? "Salvando..." : "Salvar como tática"}
              </button>
            ) : (
              <Link
                href="/planos"
                className="self-center text-sm text-muted underline-offset-4 hover:underline"
              >
                Salvar como tática: no plano Intensivo
              </Link>
            ))}
        </div>
      )}
    </div>
  );

  const tabs = (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div role="tablist" aria-label="Painel da análise" className="flex gap-1 border-b border-border">
        {(
          [
            ["lances", "Lances"],
            ["resumo", "Resumo"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`aba-${value}`}
            aria-selected={tab === value}
            aria-controls={`painel-${value}`}
            onClick={() => setTab(value)}
            className={`min-h-touch px-3 text-sm font-semibold ${tab === value ? "border-b-2 border-accent text-text" : "text-muted hover:text-text"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id={`painel-${tab}`}
        role="tabpanel"
        aria-labelledby={`aba-${tab}`}
        className="flex min-h-0 flex-1 flex-col"
      >
        {tab === "lances" ? (
          <MoveList
            sans={game.sans}
            reviewed={reviewed}
            current={index}
            onSelect={go}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <PlayerSummary
              names={names}
              accuracy={report.accuracy}
              counts={report.counts}
            />
            <p className="text-xs leading-relaxed text-muted">
              Precisão calculada a partir da chance de vitória perdida em cada
              lance. A análise é de um motor e pode divergir de outros motores.{" "}
              <Link
                href="/como-analisamos"
                className="underline underline-offset-4"
              >
                Como analisamos
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const controls = (
    <div className="flex w-full flex-col gap-2">
      <div className="grid grid-cols-5 gap-1">
        {(
          [
            ["Início", () => go(0), "⏮"],
            ["Lance anterior", () => go((v) => v - 1), "◀"],
            ["Próximo lance", () => go((v) => v + 1), "▶"],
            ["Fim", () => go(lastIndex), "⏭"],
            [
              "Virar o tabuleiro",
              () => setOrientation((side) => (side === "w" ? "b" : "w")),
              "⇅",
            ],
          ] as const
        ).map(([label, action, symbol]) => (
          <button
            key={label}
            type="button"
            className={buttonClasses("secondary", "md", "px-0 text-lg")}
            onClick={action}
            aria-label={label}
            title={label}
          >
            <span aria-hidden="true">{symbol}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={buttonClasses("secondary", "md", "flex-1 px-2")}
          onClick={nextMoment}
          disabled={moments.length === 0}
        >
          Próximo momento crítico
        </button>
        <button
          type="button"
          aria-pressed={showBest}
          onClick={() => setShowBest((value) => !value)}
          className={buttonClasses(showBest ? "outline-accent" : "ghost", "md", "px-3")}
          title="Mostrar a seta do melhor lance"
        >
          Seta
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <BoardStage
        board={
          <div className="flex gap-1 sm:gap-2">
            <EvalBar score={retry ? null : (currentEval ?? null)} orientation={orientation} />
            <div className="min-w-0 flex-1">
              <ChessBoard
                id="analise"
                fen={fen}
                orientation={orientation}
                movableColor={retry && !retry.done && !checking ? turn : null}
                lastMove={
                  lastUci
                    ? { from: lastUci.slice(0, 2), to: lastUci.slice(2, 4) }
                    : null
                }
                highlights={highlights}
                arrows={arrows}
                badge={
                  lastUci && moveReview
                    ? {
                        square: lastUci.slice(2, 4),
                        node: <MoveClassIcon cls={moveReview.cls} decorative />,
                      }
                    : null
                }
                onMove={(from, to, promotion) => {
                  void tryMove(from, to, promotion);
                  return false;
                }}
              />
            </div>
          </div>
        }
        info={info}
        actions={controls}
      >
        {retry ? retryPanel : commentCard}
        <EvalGraph
          evals={data.evals}
          total={game.fens.length}
          current={index}
          marks={marks}
          onSelect={go}
        />
        {tabs}
      </BoardStage>

      {suggestions.length > 0 && (
        <section aria-labelledby="sugestoes" className="flex flex-col gap-3">
          <h3 id="sugestoes" className="font-semibold">
            O que estudar agora
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col gap-1 rounded-card border border-border bg-surface p-4 transition hover:border-border-strong"
                >
                  <span className="font-semibold text-accent-text">
                    {item.title}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">
                    {item.reason}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
