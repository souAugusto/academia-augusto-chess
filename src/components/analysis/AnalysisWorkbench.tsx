"use client";

import { Chess, type Square } from "chess.js";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { saveAnalysis, loadImportedGame } from "@/app/(app)/analise/actions";
import { BoardStage } from "@/components/chess/BoardStage";
import {
  BOARD_COLORS,
  PlayBoard,
  type Side,
} from "@/components/chess/PlayBoard";
import { buttonClasses } from "@/components/ui/button";
import { encodeAnalysis, type AnalysisData } from "@/lib/analysis/compact";
import { ANALYSIS_DEPTHS, DEFAULT_ANALYSIS_DEPTH } from "@/lib/analysis/config";
import {
  gameFromUcis,
  parsePgn,
  PGN_ERROR_MESSAGES,
  type ParsedGame,
} from "@/lib/analysis/pgn";
import { runAnalysis } from "@/lib/analysis/pipeline";
import {
  CLASS_LABELS,
  CLASS_ORDER,
  countByClass,
  criticalMoments,
  gameAccuracy,
  reviewMoves,
  type ReviewedMove,
} from "@/lib/analysis/review";
import { suggestLessons, type LessonIndexEntry } from "@/lib/analysis/suggest";
import {
  formatEval,
  winChance,
  type EngineScore,
} from "@/lib/analysis/winprob";
import { sanToPortuguese } from "@/lib/chess/notation";
import { engineSupported, StockfishClient } from "@/lib/engine/client";
import { CLASS_STYLE } from "./classStyle";
import { EvalBar } from "./EvalBar";
import { EvalGraph } from "./EvalGraph";
import { MoveList } from "./MoveList";

type Initial =
  | { kind: "nova" }
  | {
      kind: "importada";
      gameId: number;
      color: Side;
    }
  | {
      kind: "salva";
      id: string;
      title: string;
      headers: Record<string, string>;
      data: AnalysisData;
      orientation: Side;
    };

type Loaded = {
  game: ParsedGame;
  title: string;
  importedGameId: number | null;
  lichessEvals: (EngineScore | null)[] | null;
};

type Status =
  | { kind: "entrada"; error?: string }
  | { kind: "carregando" }
  | { kind: "analisando"; done: number; total: number; depth: number }
  | { kind: "pronta"; complete: boolean };

const RETRY_LOSS = 5; // perda máxima para o lance do "Tente de novo" valer
const RETRY_DEPTH = 12;

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const timeout = AbortSignal.timeout(4000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const response = await fetch(url, { signal: combined });
  if (!response.ok) return null;
  return response.json();
}

const plyLabel = (ply: number, san: string) =>
  `${Math.floor(ply / 2) + 1}${ply % 2 === 0 ? "." : "..."}${sanToPortuguese(san)}`;

function sanOf(fen: string, uci: string | null): string | null {
  if (!uci) return null;
  try {
    return new Chess(fen).move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4],
    }).san;
  } catch {
    return null;
  }
}

export function AnalysisWorkbench({
  initial,
  lessons = [],
  completed = [],
  userColor = null,
}: {
  initial: Initial;
  lessons?: LessonIndexEntry[];
  completed?: string[];
  userColor?: Side | null; // cor do aluno, quando se sabe (partida importada)
}) {
  const [pgn, setPgn] = useState("");
  const [depth, setDepth] = useState<number>(DEFAULT_ANALYSIS_DEPTH);
  const [status, setStatus] = useState<Status>(
    initial.kind === "salva"
      ? { kind: "pronta", complete: true }
      : { kind: "entrada" },
  );
  const [loaded, setLoaded] = useState<Loaded | null>(() => {
    if (initial.kind !== "salva") return null;
    const game = gameFromUcis(initial.data.moves, undefined, initial.headers);
    return game
      ? { game, title: initial.title, importedGameId: null, lichessEvals: null }
      : null;
  });
  const [data, setData] = useState<AnalysisData | null>(
    initial.kind === "salva" ? initial.data : null,
  );
  const [orientation, setOrientation] = useState<Side>(
    initial.kind === "salva"
      ? initial.orientation
      : initial.kind === "importada"
        ? initial.color
        : "w",
  );
  const [index, setIndex] = useState(0);
  const [showBest, setShowBest] = useState(true);
  const [saved, setSaved] = useState<{ id: string } | { error: string } | null>(
    initial.kind === "salva" ? { id: initial.id } : null,
  );
  const [saving, setSaving] = useState(false);
  const engine = useRef<StockfishClient | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      abort.current?.abort();
      engine.current?.terminate();
    },
    [],
  );

  function getEngine(): StockfishClient {
    if (!engine.current) engine.current = new StockfishClient();
    return engine.current;
  }

  async function analyse(target: Loaded) {
    if (!engineSupported()) {
      setStatus({
        kind: "entrada",
        error: "Este navegador não consegue rodar o motor de análise.",
      });
      return;
    }
    const controller = new AbortController();
    abort.current = controller;
    setLoaded(target);
    setSaved(null);
    setStatus({
      kind: "analisando",
      done: 0,
      total: target.game.fens.length,
      depth,
    });
    const result = await runAnalysis({
      fens: target.game.fens,
      moves: target.game.ucis,
      ending: target.game.ending,
      depth,
      engine: getEngine(),
      lichessEvals: target.lichessEvals,
      fetchJson,
      signal: controller.signal,
      onProgress: (done, total) =>
        setStatus({ kind: "analisando", done, total, depth }),
    });
    setData(result);
    setIndex(0);
    setStatus({ kind: "pronta", complete: result.complete });
  }

  function startFromPgn() {
    const parsed = parsePgn(pgn);
    if (!parsed.ok) {
      setStatus({ kind: "entrada", error: PGN_ERROR_MESSAGES[parsed.error] });
      return;
    }
    const { headers } = parsed.game;
    const title =
      headers.White && headers.Black
        ? `${headers.White} x ${headers.Black}`
        : "Partida colada em PGN";
    void analyse({
      game: parsed.game,
      title: title.slice(0, 120),
      importedGameId: null,
      lichessEvals: null,
    });
  }

  async function startFromImported(gameId: number) {
    setStatus({ kind: "carregando" });
    const result = await loadImportedGame(gameId);
    if (!result.ok) {
      setStatus({ kind: "entrada", error: result.message });
      return;
    }
    const game = gameFromUcis(result.game.ucis, undefined, result.game.headers);
    if (!game) {
      setStatus({
        kind: "entrada",
        error: "Não consegui ler os lances dessa partida.",
      });
      return;
    }
    void analyse({
      game,
      title: result.game.title,
      importedGameId: gameId,
      lichessEvals: result.game.lichessEvals,
    });
  }

  async function save() {
    if (!loaded || !data) return;
    setSaving(true);
    const result = await saveAnalysis({
      importedGameId: loaded.importedGameId,
      title: loaded.title,
      headers: loaded.game.headers,
      data: encodeAnalysis(data),
    });
    setSaving(false);
    setSaved(result.ok ? { id: result.id } : { error: result.message });
  }

  // ------------------------------------------------------------------ entrada
  if (status.kind === "entrada" || status.kind === "carregando") {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        {initial.kind === "importada" ? (
          <p className="leading-relaxed text-muted">
            A partida vai ser buscada no site de origem e analisada aqui no seu
            navegador.
          </p>
        ) : (
          <label className="flex flex-col gap-2">
            <span className="font-semibold">Cole o PGN da partida</span>
            <textarea
              value={pgn}
              onChange={(event) => setPgn(event.target.value)}
              rows={8}
              spellCheck={false}
              className="rounded-control border border-border bg-surface p-3 font-mono text-sm"
              placeholder={
                '[White "Você"]\n[Black "Adversário"]\n\n1. e4 e5 2. Nf3 ...'
              }
            />
          </label>
        )}
        <DepthPicker depth={depth} onChange={setDepth} />
        {status.kind === "entrada" && status.error && (
          <p role="alert" className="text-danger">
            {status.error}
          </p>
        )}
        <div>
          <button
            type="button"
            className={buttonClasses("primary")}
            disabled={status.kind === "carregando"}
            onClick={() =>
              initial.kind === "importada"
                ? void startFromImported(initial.gameId)
                : startFromPgn()
            }
          >
            {status.kind === "carregando"
              ? "Buscando a partida..."
              : "Analisar"}
          </button>
        </div>
        <p className="text-sm text-muted">
          A análise roda no seu aparelho com o Stockfish. As primeiras jogadas
          usam a nuvem do Lichess, quando ela conhece a posição.
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------- analisando
  if (status.kind === "analisando") {
    const percent = Math.round((status.done / Math.max(1, status.total)) * 100);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <p className="font-semibold">
          Analisando a partida (profundidade {status.depth})...
        </p>
        <div
          className="h-3 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da análise"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-sm text-muted">
          {status.done} de {status.total} posições
        </p>
        <div>
          <button
            type="button"
            className={buttonClasses("secondary")}
            onClick={() => abort.current?.abort()}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------- pronta
  if (!loaded || !data) return null;
  return (
    <AnalysisView
      loaded={loaded}
      data={data}
      complete={status.complete}
      index={index}
      setIndex={setIndex}
      orientation={orientation}
      flip={() => setOrientation((side) => (side === "w" ? "b" : "w"))}
      showBest={showBest}
      setShowBest={setShowBest}
      getEngine={getEngine}
      lessons={lessons}
      completed={completed}
      userColor={userColor}
      saveSlot={
        saved && "id" in saved ? (
          <p className="text-sm text-success">
            Análise salva.{" "}
            <Link
              href={`/analise/${saved.id}`}
              className="underline underline-offset-4"
            >
              Abrir
            </Link>
          </p>
        ) : status.complete ? (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              className={buttonClasses("secondary")}
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? "Salvando..." : "Salvar análise"}
            </button>
            {saved && "error" in saved && (
              <p role="alert" className="text-sm text-danger">
                {saved.error}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted">
            Análise interrompida: só a parte calculada aparece, e ela não pode
            ser salva.
          </p>
        )
      }
    />
  );
}

function DepthPicker({
  depth,
  onChange,
}: {
  depth: number;
  onChange: (depth: number) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-semibold">Profundidade</legend>
      <div className="flex flex-wrap gap-2">
        {ANALYSIS_DEPTHS.map((value) => (
          <label
            key={value}
            className={`cursor-pointer rounded-control border px-3 py-2 text-sm ${value === depth ? "border-accent bg-accent text-on-accent" : "border-border hover:bg-surface-2"}`}
          >
            <input
              type="radio"
              name="profundidade"
              value={value}
              checked={value === depth}
              onChange={() => onChange(value)}
              className="sr-only"
            />
            {value}
            {value === DEFAULT_ANALYSIS_DEPTH ? " (padrão)" : ""}
          </label>
        ))}
      </div>
      <p className="text-xs text-muted">
        Mais profundidade é mais precisa, mas demora mais no seu aparelho.
      </p>
    </fieldset>
  );
}

function AnalysisView({
  loaded,
  data,
  complete,
  index,
  setIndex,
  orientation,
  flip,
  showBest,
  setShowBest,
  getEngine,
  lessons,
  completed,
  userColor,
  saveSlot,
}: {
  loaded: Loaded;
  data: AnalysisData;
  complete: boolean;
  index: number;
  setIndex: (index: number | ((value: number) => number)) => void;
  orientation: Side;
  flip: () => void;
  showBest: boolean;
  setShowBest: (value: boolean) => void;
  getEngine: () => StockfishClient;
  lessons: LessonIndexEntry[];
  completed: string[];
  userColor: Side | null;
  saveSlot: ReactNode;
}) {
  const { game } = loaded;
  const reviewed = useMemo(
    () => reviewMoves(data.evals, data.best, game.ucis),
    [data, game.ucis],
  );
  const lastIndex = Math.min(game.fens.length - 1, data.evals.length - 1);
  const [retry, setRetry] = useState<{
    ply: number;
    tries: number;
    message: string | null;
    done: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (event.key === "ArrowRight")
        setIndex((v) => Math.min(lastIndex, v + 1));
      if (event.key === "ArrowLeft") setIndex((v) => Math.max(0, v - 1));
      if (event.key === "Home") setIndex(0);
      if (event.key === "End") setIndex(lastIndex);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lastIndex, setIndex]);

  const critical = criticalMoments(reviewed);
  const suggestions = useMemo(
    () =>
      suggestLessons({
        moves: game.ucis,
        fens: game.fens,
        reviewed,
        lessons,
        userColor,
        completed: new Set(completed),
      }),
    [game, reviewed, lessons, userColor, completed],
  );
  const fen = retry ? game.fens[retry.ply] : game.fens[index];
  const lastUci = !retry && index > 0 ? game.ucis[index - 1] : null;
  const bestHere = data.best[index] ?? null;
  const arrows =
    !retry && showBest && bestHere && index < game.ucis.length
      ? [
          {
            startSquare: bestHere.slice(0, 2),
            endSquare: bestHere.slice(2, 4),
            color: BOARD_COLORS.arrow,
          },
        ]
      : [];
  const moveReview = index > 0 ? reviewed[index - 1] : undefined;
  const turn = fen.split(" ")[1] === "b" ? "b" : "w";

  async function tryMove(
    from: Square,
    to: Square,
    promotion?: string,
  ): Promise<boolean> {
    if (!retry || retry.done) return false;
    const chess = new Chess(game.fens[retry.ply]);
    let san: string;
    try {
      san = chess.move({ from, to, promotion: promotion ?? "q" }).san;
    } catch {
      return false;
    }
    const target = reviewed[retry.ply];
    if (!target) return false;
    setChecking(true);
    let after: number;
    if (chess.isCheckmate()) after = 100;
    else if (chess.isDraw()) after = 50;
    else {
      const result = await getEngine().analyseDepth(chess.fen(), {
        depth: RETRY_DEPTH,
      });
      const line = result.lines[0];
      // O motor avalia do ponto de vista de quem joga agora (o adversário).
      after = line ? 100 - winChance(line.score) : 50;
    }
    setChecking(false);
    const loss = Math.max(0, target.before - after);
    const tries = retry.tries + 1;
    if (loss < RETRY_LOSS) {
      setRetry({
        ...retry,
        tries,
        done: true,
        message: `Muito bem! ${sanToPortuguese(san)} mantém a posição.`,
      });
    } else {
      const bestSan = sanOf(game.fens[retry.ply], target.best);
      setRetry({
        ...retry,
        tries,
        done: tries >= 2,
        message:
          tries >= 2
            ? `${sanToPortuguese(san)} ainda perde. O melhor era ${bestSan ? sanToPortuguese(bestSan) : "outro lance"}.`
            : `${sanToPortuguese(san)} também perde. Tente mais uma vez.`,
      });
    }
    return false;
  }

  const white = gameAccuracy(reviewed, "w");
  const black = gameAccuracy(reviewed, "b");
  const counts = {
    w: countByClass(reviewed, "w"),
    b: countByClass(reviewed, "b"),
  };
  const names = {
    w: game.headers.White ?? "Brancas",
    b: game.headers.Black ?? "Pretas",
  };

  const info = retry ? (
    <div className="flex flex-col gap-2">
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
          className={
            retry.done && retry.message.startsWith("Muito bem")
              ? "text-success"
              : "text-[0.9375rem]"
          }
        >
          {retry.message}
        </p>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-muted">
        Avaliação: {data.evals[index] ? formatEval(data.evals[index]) : "..."}
      </p>
      {moveReview ? (
        <p className="text-[0.9375rem] leading-relaxed">
          <span className="font-semibold">
            {plyLabel(moveReview.ply, game.sans[moveReview.ply])}
          </span>{" "}
          <span className={CLASS_STYLE[moveReview.cls].text}>
            {CLASS_LABELS[moveReview.cls]}
          </span>
          {moveReview.cls !== "melhor" && moveReview.best && (
            <>
              {". "}Melhor era{" "}
              {sanToPortuguese(
                sanOf(game.fens[moveReview.ply], moveReview.best) ?? "",
              )}
            </>
          )}
          {moveReview.loss >= 2 &&
            ` (perdeu ${Math.round(moveReview.loss)} pontos de chance)`}
          .
        </p>
      ) : (
        <p className="text-[0.9375rem]">Posição inicial.</p>
      )}
      {bestHere && index < game.ucis.length && (
        <p className="text-sm text-muted">
          Melhor lance aqui: {sanToPortuguese(sanOf(fen, bestHere) ?? "")}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{loaded.title}</h2>
        {saveSlot}
      </div>
      <BoardStage
        board={
          <div className="flex gap-2">
            <EvalBar
              score={retry ? null : (data.evals[index] ?? null)}
              orientation={orientation}
            />
            <div className="min-w-0 flex-1">
              <PlayBoard
                id="analise"
                fen={fen}
                orientation={orientation}
                movableColor={retry && !retry.done && !checking ? turn : null}
                lastMove={
                  lastUci
                    ? { from: lastUci.slice(0, 2), to: lastUci.slice(2, 4) }
                    : null
                }
                arrows={arrows}
                onMove={(from, to, promotion) => {
                  void tryMove(from, to, promotion);
                  return false;
                }}
              />
            </div>
          </div>
        }
        info={info}
        actions={
          retry ? (
            <button
              type="button"
              className={buttonClasses("secondary")}
              onClick={() => setRetry(null)}
            >
              Voltar à análise
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={buttonClasses("ghost")}
                onClick={() => setIndex(0)}
                aria-label="Início"
              >
                ⏮
              </button>
              <button
                type="button"
                className={buttonClasses("secondary")}
                onClick={() => setIndex((v) => Math.max(0, v - 1))}
              >
                Voltar
              </button>
              <button
                type="button"
                className={buttonClasses("secondary")}
                onClick={() => setIndex((v) => Math.min(lastIndex, v + 1))}
              >
                Avançar
              </button>
              <button
                type="button"
                className={buttonClasses("ghost")}
                onClick={() => setIndex(lastIndex)}
                aria-label="Fim"
              >
                ⏭
              </button>
              <button
                type="button"
                className={buttonClasses("ghost")}
                onClick={flip}
              >
                Girar
              </button>
              {moveReview &&
                ["imprecisao", "erro", "gafe"].includes(moveReview.cls) && (
                  <button
                    type="button"
                    className={buttonClasses("outline-accent")}
                    onClick={() =>
                      setRetry({
                        ply: moveReview.ply,
                        tries: 0,
                        message: null,
                        done: false,
                      })
                    }
                  >
                    Tente de novo
                  </button>
                )}
            </div>
          )
        }
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showBest}
            onChange={(event) => setShowBest(event.target.checked)}
          />
          Mostrar a seta do melhor lance
        </label>
        <MoveList
          sans={game.sans}
          reviewed={reviewed}
          current={index}
          onSelect={setIndex}
        />
      </BoardStage>

      {!complete && (
        <p className="text-sm text-muted">
          A análise foi interrompida no lance {Math.ceil(lastIndex / 2)}.
        </p>
      )}

      <EvalGraph
        evals={data.evals}
        current={index}
        marks={critical.map((move) => move.ply + 1)}
        onSelect={setIndex}
      />

      <section aria-labelledby="resumo" className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
          <h3 id="resumo" className="font-semibold">
            Resumo
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 font-normal" />
                <th className="py-1 font-semibold">{names.w}</th>
                <th className="py-1 font-semibold">{names.b}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 text-muted">Precisão</td>
                <td className="py-1 font-semibold">
                  {white === null ? "—" : `${white.toLocaleString("pt-BR")}%`}
                </td>
                <td className="py-1 font-semibold">
                  {black === null ? "—" : `${black.toLocaleString("pt-BR")}%`}
                </td>
              </tr>
              {CLASS_ORDER.map((cls) => (
                <tr key={cls}>
                  <td className="py-1">
                    <span className={CLASS_STYLE[cls].text}>
                      {CLASS_STYLE[cls].symbol}
                    </span>{" "}
                    {CLASS_LABELS[cls]}
                  </td>
                  <td className="py-1">{counts.w[cls]}</td>
                  <td className="py-1">{counts.b[cls]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted">
            Precisão calculada a partir da perda de chance de vitória em cada
            lance.
          </p>
        </div>
        <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-5">
          <h3 className="font-semibold">Momentos críticos</h3>
          {critical.length === 0 ? (
            <p className="text-sm text-muted">
              Nenhum erro relevante nesta partida.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {critical.map((move) => (
                <CriticalItem
                  key={move.ply}
                  move={move}
                  san={game.sans[move.ply]}
                  bestSan={sanOf(game.fens[move.ply], move.best)}
                  onOpen={() => setIndex(move.ply + 1)}
                  onRetry={() => {
                    setIndex(move.ply + 1);
                    setRetry({
                      ply: move.ply,
                      tries: 0,
                      message: null,
                      done: false,
                    });
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </section>

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

function CriticalItem({
  move,
  san,
  bestSan,
  onOpen,
  onRetry,
}: {
  move: ReviewedMove;
  san: string;
  bestSan: string | null;
  onOpen: () => void;
  onRetry: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-surface-2 p-3">
      <button
        type="button"
        onClick={onOpen}
        className="text-left text-[0.9375rem]"
      >
        <span className="font-semibold">{plyLabel(move.ply, san)}</span>{" "}
        <span className={CLASS_STYLE[move.cls].text}>
          {CLASS_LABELS[move.cls]}
        </span>
        {bestSan && (
          <span className="text-muted">
            {" "}
            · melhor era {sanToPortuguese(bestSan)}
          </span>
        )}
      </button>
      <button
        type="button"
        className={buttonClasses("ghost")}
        onClick={onRetry}
      >
        Tente de novo
      </button>
    </li>
  );
}
