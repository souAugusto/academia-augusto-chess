"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  findSavedAnalysis,
  loadImportedGame,
  saveAnalysis,
} from "@/app/(app)/analise/actions";
import { buttonClasses } from "@/components/ui/button";
import type { Side } from "@/components/chess/ChessBoard";
import { readCachedAnalysis, writeCachedAnalysis } from "@/lib/analysis/cache";
import {
  decodeAnalysis,
  encodeAnalysis,
  type AnalysisData,
} from "@/lib/analysis/compact";
import {
  gameFromUcis,
  parsePgn,
  PGN_ERROR_MESSAGES,
  type ParsedGame,
} from "@/lib/analysis/pgn";
import { runAnalysis, type Progress } from "@/lib/analysis/pipeline";
import { ANALYSIS_PROFILE } from "@/lib/analysis/profile";
import { loadOpeningBook, pgnGameKey } from "@/lib/analysis/report";
import { theoryOf, type OpeningBook } from "@/lib/analysis/theory";
import type { LessonIndexEntry } from "@/lib/analysis/suggest";
import { engineSupported, StockfishClient } from "@/lib/engine/client";
import { AnalysisView, type Loaded } from "./AnalysisView";

type Initial =
  | { kind: "nova" }
  | { kind: "importada"; gameId: number; color: Side }
  | {
      kind: "salva";
      id: string;
      title: string;
      headers: Record<string, string>;
      data: AnalysisData;
      orientation: Side;
      importedGameId: number | null;
      outdated: boolean; // perfil do motor diferente do atual
      algoOutdated: boolean; // só as regras mudaram (recalcula sem o motor)
    };

type Status =
  | { kind: "entrada"; error?: string }
  | { kind: "carregando" }
  | { kind: "analisando"; progress: Progress; slow: boolean }
  | { kind: "pronta"; complete: boolean };

type Saved = { id: string } | { error: string } | null;

const cacheKey = (loaded: Loaded) =>
  loaded.importedGameId !== null
    ? `importada:${loaded.importedGameId}`
    : pgnGameKey(loaded.game.ucis);

export function AnalysisWorkbench({
  initial,
  lessons = [],
  completed = [],
  userColor = null,
  canSaveTactic = false,
}: {
  initial: Initial;
  lessons?: LessonIndexEntry[];
  completed?: string[];
  userColor?: Side | null;
  canSaveTactic?: boolean;
}) {
  const router = useRouter();
  const [pgn, setPgn] = useState("");
  const [status, setStatus] = useState<Status>(
    initial.kind === "salva"
      ? { kind: "pronta", complete: true }
      : { kind: "entrada" },
  );
  const [loaded, setLoaded] = useState<Loaded | null>(() => {
    if (initial.kind !== "salva") return null;
    const game = gameFromUcis(initial.data.moves, undefined, initial.headers);
    return game
      ? {
          game,
          title: initial.title,
          importedGameId: initial.importedGameId,
        }
      : null;
  });
  const [data, setData] = useState<AnalysisData | null>(
    initial.kind === "salva" ? initial.data : null,
  );
  const [outdated, setOutdated] = useState(
    initial.kind === "salva" && (initial.outdated || initial.data.version !== 2),
  );
  const [saved, setSaved] = useState<Saved>(
    initial.kind === "salva" ? { id: initial.id } : null,
  );
  const [book, setBook] = useState<OpeningBook | null>(null);
  const [slowDismissed, setSlowDismissed] = useState(false);
  const engine = useRef<StockfishClient | null>(null);
  const abort = useRef<AbortController | null>(null);

  // A teoria de aberturas (~76 KB) só é baixada quando há partida para
  // mostrar: análise guardada agora, partida nova quando a análise começa.
  useEffect(() => {
    let alive = true;
    if (initial.kind === "salva")
      void loadOpeningBook().then((value) => {
        if (alive) setBook(value);
      });
    return () => {
      alive = false;
      abort.current?.abort();
      engine.current?.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao abrir
  }, []);

  // Análise guardada com regras antigas (mesmo motor): o resumo é refeito no
  // servidor a partir dos mesmos dados, sem rodar o motor de novo.
  const refreshed = useRef(false);
  useEffect(() => {
    if (
      initial.kind !== "salva" ||
      !initial.algoOutdated ||
      initial.outdated ||
      initial.data.version !== 2 ||
      refreshed.current
    )
      return;
    refreshed.current = true;
    void saveAnalysis({
      importedGameId: initial.importedGameId,
      title: initial.title,
      headers: initial.headers,
      data: encodeAnalysis(initial.data),
    });
  }, [initial]);

  function getEngine(): StockfishClient {
    if (!engine.current) engine.current = new StockfishClient();
    return engine.current;
  }

  async function store(target: Loaded, result: AnalysisData) {
    const encoded = encodeAnalysis(result);
    void writeCachedAnalysis(cacheKey(target), encoded);
    const response = await saveAnalysis({
      importedGameId: target.importedGameId,
      title: target.title,
      headers: target.game.headers,
      data: encoded,
    });
    setSaved(response.ok ? { id: response.id } : { error: response.message });
  }

  async function analyse(target: Loaded, options: { useCache: boolean }) {
    if (!engineSupported()) {
      setStatus({
        kind: "entrada",
        error: "Este navegador não consegue rodar o motor de análise.",
      });
      return;
    }
    setLoaded(target);
    setSaved(null);
    setOutdated(false);
    setSlowDismissed(false);
    // Teoria de aberturas: carregada agora (vale para cache, servidor e motor).
    const openingBook = book ?? (await loadOpeningBook());
    setBook(openingBook);

    if (options.useCache) {
      // 1. Cache do aparelho. 2. Análise guardada no servidor.
      const cached = decodeAnalysis(await readCachedAnalysis(cacheKey(target)));
      if (cached && cached.version === 2 && cached.depth === ANALYSIS_PROFILE.depth) {
        setData(cached);
        setStatus({ kind: "pronta", complete: true });
        void store(target, cached);
        return;
      }
      const found = await findSavedAnalysis({
        importedGameId: target.importedGameId,
        moves: target.game.ucis,
      });
      if (found?.fresh) {
        router.push(`/analise/${found.id}`);
        return;
      }
    }

    const controller = new AbortController();
    abort.current = controller;
    const total = target.game.fens.length;
    setData(null);
    setStatus({
      kind: "analisando",
      progress: { phase: 1, done: 0, total },
      slow: false,
    });
    const { bookPlies } = theoryOf(target.game.fens, openingBook);
    const started = performance.now();
    const result = await runAnalysis({
      fens: target.game.fens,
      moves: target.game.ucis,
      ending: target.game.ending,
      bookPlies,
      engine: getEngine(),
      signal: controller.signal,
      onUpdate: (partial, progress) => {
        setData(partial);
        // Previsão do tempo total a partir do ritmo da passagem 1 (a passagem
        // 2 custa umas 3 posições por candidata, no máximo).
        let slow = false;
        if (progress.phase === 1 && progress.done >= Math.max(6, total * 0.12)) {
          const perPosition = (performance.now() - started) / progress.done;
          const remaining =
            perPosition *
            (total - progress.done + ANALYSIS_PROFILE.maxDeepPositions * 3);
          slow = performance.now() - started + remaining > ANALYSIS_PROFILE.slowWarningMs;
        }
        setStatus((current) => ({
          kind: "analisando",
          progress,
          slow:
            current.kind === "analisando"
              ? current.slow || slow
              : slow,
        }));
      },
    });
    setData(result);
    setStatus({ kind: "pronta", complete: result.complete });
    if (result.complete) await store(target, result);
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
    void analyse(
      { game: parsed.game, title: title.slice(0, 120), importedGameId: null },
      { useCache: true },
    );
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
    void analyse(
      { game, title: result.game.title, importedGameId: gameId },
      { useCache: true },
    );
  }

  // Partida importada: começa sozinha (não há o que escolher).
  const autoStarted = useRef(false);
  useEffect(() => {
    if (initial.kind !== "importada" || autoStarted.current) return;
    autoStarted.current = true;
    void startFromImported(initial.gameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só ao abrir
  }, []);

  // ------------------------------------------------------------------ entrada
  if (status.kind === "entrada" || status.kind === "carregando") {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        {initial.kind === "importada" ? (
          <p className="leading-relaxed text-muted">
            {status.kind === "carregando"
              ? "Buscando a partida no site de origem..."
              : "Não foi possível abrir a partida."}
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
              : initial.kind === "importada"
                ? "Tentar de novo"
                : "Analisar"}
          </button>
        </div>
        <p className="text-sm text-muted">
          A análise roda no seu aparelho com o {ANALYSIS_PROFILE.engineName}, no
          mesmo padrão profundo para todos os alunos.
        </p>
      </div>
    );
  }

  if (!loaded) return null;
  const analysing = status.kind === "analisando" ? status : null;
  const total = loaded.game.fens.length;

  return (
    <div className="flex flex-col gap-4">
      {analysing && (
        <div
          className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4"
          aria-live="polite"
        >
          <p className="font-semibold">
            Analisando em profundidade. Você já pode ver os primeiros lances.
          </p>
          <ProgressBar progress={analysing.progress} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">
              {analysing.progress.phase === 1
                ? `Analisando lance ${Math.min(analysing.progress.done + 1, total - 1)} de ${total - 1}`
                : `Segunda análise dos lances decisivos: ${analysing.progress.done} de ${analysing.progress.total}`}
            </p>
            <button
              type="button"
              className={buttonClasses("secondary")}
              onClick={() => abort.current?.abort()}
            >
              Cancelar
            </button>
          </div>
          {analysing.slow && !slowDismissed && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-control border border-accent/50 bg-accent/10 p-3"
            >
              <p className="text-sm leading-relaxed">
                Este aparelho está lento para a análise profunda. Tente em um
                computador ou continue aguardando.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={buttonClasses("secondary")}
                  onClick={() => setSlowDismissed(true)}
                >
                  Continuar aguardando
                </button>
                <button
                  type="button"
                  className={buttonClasses("ghost")}
                  onClick={() => abort.current?.abort()}
                >
                  Cancelar a análise
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {status.kind === "pronta" && !status.complete && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4">
          <p className="text-sm text-muted">
            Análise interrompida: só a parte calculada aparece, e ela não foi
            guardada.
          </p>
          <button
            type="button"
            className={buttonClasses("secondary")}
            onClick={() => void analyse(loaded, { useCache: false })}
          >
            Analisar de novo
          </button>
        </div>
      )}

      {outdated && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-accent/50 bg-accent/10 p-4">
          <p className="text-sm leading-relaxed">
            Esta análise foi feita num padrão antigo. Reanalise para ver as
            classes novas (como Brilhante e Ótimo) e a precisão atual.
          </p>
          <button
            type="button"
            className={buttonClasses("primary")}
            onClick={() => void analyse(loaded, { useCache: false })}
          >
            Reanalisar
          </button>
        </div>
      )}

      {saved && "error" in saved && (
        <p role="alert" className="text-sm text-danger">
          {saved.error}
        </p>
      )}

      {data && data.evals.length > 0 ? (
        <AnalysisView
          loaded={loaded}
          data={data}
          book={book}
          analysing={!!analysing}
          initialOrientation={
            initial.kind === "salva"
              ? initial.orientation
              : initial.kind === "importada"
                ? initial.color
                : "w"
          }
          lessons={lessons}
          completed={completed}
          userColor={userColor}
          canSaveTactic={canSaveTactic}
          savedNote={
            saved && "id" in saved && status.kind === "pronta"
              ? "Análise guardada."
              : null
          }
        />
      ) : (
        <p className="text-sm text-muted">Preparando o motor...</p>
      )}
    </div>
  );
}

function ProgressBar({ progress }: { progress: Progress }) {
  // Passagem 1 vale 80% da barra; a passagem 2, os 20% finais.
  const ratio = progress.done / Math.max(1, progress.total);
  const percent = Math.round(
    progress.phase === 1 ? ratio * 80 : 80 + ratio * 20,
  );
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-surface-2"
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
  );
}

export type { ParsedGame };
