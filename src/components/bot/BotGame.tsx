"use client";

import { Chess, type Square } from "chess.js";
import Link from "next/link";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Arrow } from "react-chessboard";
import { BoardStage } from "@/components/chess/BoardStage";
import { BOARD_COLORS, ChessBoard, type Side } from "@/components/chess/ChessBoard";
import { buttonClasses } from "@/components/ui/button";
import { BOTS } from "@/content/personagens";
import { flip, type EngineScore } from "@/lib/analysis/winprob";
import { candidatesFromLines, legalUcis, uciToMove } from "@/lib/bot/candidates";
import { bookMove, chooseMove } from "@/lib/bot/choose";
import {
  acceptsDraw,
  canOfferDraw,
  CLOCKS,
  END_TEXT,
  formatClock,
  positionOutcome,
  starsFor,
  timeoutOutcome,
  type ClockId,
  type Outcome,
} from "@/lib/bot/game";
import { botStatus, type Achievement, type Progress } from "@/lib/bot/progress";
import { gameAccuracy, markFor, moveLoss, type MoveMark } from "@/lib/bot/review";
import { REACTION_EXPRESSION, type Bot, type Expression, type Reaction } from "@/lib/bot/types";
import { engineSupported, StockfishClient } from "@/lib/engine/client";
import { scoreToCp, type Score } from "@/lib/engine/uci";
import { playSound } from "@/lib/sound";
import { BotAvatar } from "./BotAvatar";
import { Stars, STYLE_LABELS } from "./BotTrail";
import { BOT_ORDER, useBotProgress } from "./useBotProgress";

// Busca na vez do aluno: dá a dica e a avaliação "antes" do lance dele.
const PLAYER_DEPTH = 10;
const MIN_USEFUL_DEPTH = 6; // busca interrompida ainda serve a partir daqui
const MIN_THINK_MS = 600; // o personagem "pensa" pelo menos isso (fica natural)
const BUBBLE_MS = 4000;
const START_FEN = new Chess().fen();

type Phase = "setup" | "playing" | "over" | "review";
type ColorChoice = Side | "aleatorio";

// Avaliação de cada lance do aluno (ponto de vista dele), para a precisão.
type PlayerMove = {
  ply: number; // índice do lance na partida (0 = primeiro lance)
  fenBefore: string;
  fenAfter: string;
  played: string;
  best: string | null;
  before: EngineScore | null;
  after: EngineScore | null;
};

const MARK_SYMBOL: Record<Exclude<MoveMark, null>, string> = {
  "erro-grave": "??",
  erro: "?",
  imprecisao: "?!",
};
const MARK_CLASS: Record<Exclude<MoveMark, null>, string> = {
  "erro-grave": "text-cls-erro-grave",
  erro: "text-cls-erro",
  imprecisao: "text-cls-imprecisao",
};

const RESULT_TITLE = {
  vitoria: "Você venceu!",
  derrota: "Você perdeu",
  empate: "Empate",
} as const;

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={value === option.id}
            onClick={() => onChange(option.id)}
            className={`min-h-touch rounded-control border px-3 text-[0.9375rem] font-semibold transition ${
              value === option.id
                ? "border-accent bg-accent text-on-accent"
                : "border-border bg-surface text-muted hover:text-text"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// Partida contra um personagem: escolha de cor e relógio, jogo com falas,
// dica e desfazer limitados, empate, abandono, fim de partida e revisão.
export function BotGame({
  botId,
  loggedIn,
  serverProgress,
}: {
  botId: string;
  loggedIn: boolean;
  serverProgress: Progress;
}) {
  const bot = BOTS.find((item) => item.id === botId) as Bot;
  const next = BOTS[BOT_ORDER.indexOf(bot.id) + 1] ?? null;
  const { progress, ready, record } = useBotProgress(loggedIn, serverProgress);
  const status = ready ? botStatus(BOT_ORDER, progress, bot.id) : null;
  // A partida termina dentro de buscas assíncronas: usa sempre o registro atual.
  const recordRef = useRef(record);
  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  const [colorChoice, setColorChoice] = useState<ColorChoice>("w");
  const [clockId, setClockId] = useState<ClockId>("sem");
  const clockConfig = CLOCKS.find((item) => item.id === clockId) ?? CLOCKS[0];
  const clockOn = clockConfig.baseMs > 0;

  const engine = useRef<StockfishClient | null>(null);
  const [engineState, setEngineState] = useState<"loading" | "ready" | "error">("loading");

  // Estado mutável da partida (lido nas buscas assíncronas).
  const chess = useRef(new Chess());
  const generation = useRef(0); // invalida buscas antigas (desfazer, sair, recomeçar)
  const over = useRef(false);
  const playerRef = useRef<Side>("w");
  const playerSearch = useRef<AbortController | null>(null);
  const bestForPlayer = useRef<string | null>(null);
  const beforeScore = useRef<EngineScore | null>(null);
  const botEvalCp = useRef<number | null>(null);
  const movesRef = useRef<PlayerMove[]>([]);
  const usedUndo = useRef(false);
  const usedHint = useRef(false);
  const pendingHint = useRef(false);
  const clockRef = useRef({ w: 0, b: 0 });

  // Espelho do estado para a tela.
  const [phase, setPhase] = useState<Phase>("setup");
  const [player, setPlayer] = useState<Side>("w");
  const [fen, setFen] = useState(START_FEN);
  const [history, setHistory] = useState<{ san: string; from: string; to: string; after: string }[]>([]);
  const [playerMoves, setPlayerMoves] = useState<PlayerMove[]>([]);
  const [thinking, setThinking] = useState(false);
  const [hint, setHint] = useState<Arrow | null>(null);
  const [hintsLeft, setHintsLeft] = useState(bot.ajudas.dicas);
  const [undosLeft, setUndosLeft] = useState(bot.ajudas.desfazer);
  const [lastOfferPly, setLastOfferPly] = useState<number | null>(null);
  const [confirmResign, setConfirmResign] = useState(false);
  const [bubble, setBubble] = useState<{ text: string; expression: Expression; key: number } | null>(
    null,
  );
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [stars, setStars] = useState(0);
  const [achievementsWon, setAchievementsWon] = useState<Achievement[]>([]);
  const [reviewPly, setReviewPly] = useState(0);
  const [clock, setClock] = useState({ w: 0, b: 0 });
  const [copied, setCopied] = useState(false);

  function say(reaction: Reaction, text?: string) {
    setBubble({
      text: text ?? pick(bot.frases[reaction]),
      expression: REACTION_EXPRESSION[reaction],
      key: Date.now(),
    });
  }

  // O balão some depois de alguns segundos (no fim da partida, fica).
  useEffect(() => {
    if (!bubble || phase === "over" || phase === "review" || phase === "setup") return;
    const timer = window.setTimeout(() => setBubble(null), BUBBLE_MS);
    return () => window.clearTimeout(timer);
  }, [bubble, phase]);

  function sync() {
    const game = chess.current;
    setFen(game.fen());
    setHistory(
      game.history({ verbose: true }).map((m) => ({ san: m.san, from: m.from, to: m.to, after: m.after })),
    );
    setPlayerMoves([...movesRef.current]);
  }

  // Liga o motor ao abrir a partida (só nesta tela) e desliga ao sair.
  useEffect(() => {
    if (!engineSupported()) {
      void Promise.resolve().then(() => setEngineState("error"));
      return;
    }
    const client = new StockfishClient();
    engine.current = client;
    client.ready.then(
      () => setEngineState("ready"),
      () => setEngineState("error"),
    );
    return () => {
      generation.current += 1;
      playerSearch.current?.abort();
      client.terminate();
      engine.current = null;
    };
  }, []);

  // A fala de apresentação aparece na tela de escolha.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sorteio da fala só no navegador
    setBubble({ text: pick(bot.frases.intro), expression: "normal", key: 0 });
  }, [bot]);

  function finish(result: Outcome) {
    if (over.current) return;
    over.current = true;
    generation.current += 1;
    playerSearch.current?.abort();
    setThinking(false);
    setHint(null);
    setConfirmResign(false);
    const game = chess.current;
    const names = playerRef.current === "w" ? ["Você", bot.nome] : [bot.nome, "Você"];
    game.setHeader("Event", "Academia Finale: jogar contra o computador");
    game.setHeader("White", names[0]);
    game.setHeader("Black", names[1]);
    const score =
      result.result === "empate"
        ? "1/2-1/2"
        : (result.result === "vitoria") === (playerRef.current === "w")
          ? "1-0"
          : "0-1";
    game.setHeader("Result", score);
    const earned = starsFor(result.result, usedUndo.current, usedHint.current);
    const won = recordRef.current(bot.id, result.result, earned);
    setOutcome(result);
    setStars(earned);
    setAchievementsWon(won);
    setPhase("over");
    sync();
    say(result.result);
    if (result.reason !== "mate") playSound("gameEnd");
    if (won.length > 0) playSound("title");
  }

  function checkEnd(): boolean {
    const game = chess.current;
    const result = positionOutcome(
      {
        isCheckmate: game.isCheckmate(),
        isStalemate: game.isStalemate(),
        isThreefoldRepetition: game.isThreefoldRepetition(),
        isInsufficientMaterial: game.isInsufficientMaterial(),
        isDraw: game.isDraw(),
        turn: game.turn(),
      },
      playerRef.current,
    );
    if (!result) return false;
    finish(result);
    return true;
  }

  function showHintArrow() {
    const best = bestForPlayer.current;
    if (!best) return;
    const move = uciToMove(best);
    setHint({ startSquare: move.from, endSquare: move.to, color: BOARD_COLORS.arrow });
  }

  // Vez do aluno: o motor avalia a posição (dica e precisão) sem limitar força.
  async function playerTurn(run: number) {
    bestForPlayer.current = null;
    beforeScore.current = null;
    const client = engine.current;
    if (!client) return;
    const controller = new AbortController();
    playerSearch.current = controller;
    const position = chess.current.fen();
    client.setStrength(null);
    try {
      const analysis = await client.analyseDepth(position, {
        depth: PLAYER_DEPTH,
        multipv: 1,
        signal: controller.signal,
      });
      const line = analysis.lines[0];
      if (run !== generation.current || !line) return;
      if (analysis.cancelled && analysis.depth < MIN_USEFUL_DEPTH) return;
      // O aluno já jogou: completa a avaliação daquele lance.
      const done = movesRef.current.at(-1);
      if (done && done.fenBefore === position) {
        done.before ??= line.score;
        done.best ??= line.move;
        return;
      }
      bestForPlayer.current = line.move;
      beforeScore.current = line.score;
      if (pendingHint.current) {
        pendingHint.current = false;
        showHintArrow();
      }
    } catch {
      // Motor encerrado (saiu da página).
    }
  }

  // Vez do personagem: abertura preferida, ou o motor com o jeito do nível.
  async function botTurn(run: number) {
    const client = engine.current;
    if (!client) return;
    setThinking(true);
    const started = performance.now();
    const game = chess.current;
    const position = game.fen();
    let uci: string | null = null;
    let score: Score | null = null;

    const book = bookMove(bot.aberturas, game.history(), Math.random);
    if (book) {
      try {
        const move = game.move(book);
        game.undo();
        uci = `${move.from}${move.to}${move.promotion ?? ""}`;
      } catch {
        uci = null;
      }
    }

    try {
      if (!uci) {
        const motor = bot.motor;
        if (motor.mode === "multipv") {
          client.setStrength(null);
          const analysis = await client.analyseDepth(position, {
            depth: motor.depth,
            multipv: motor.multipv,
          });
          score = analysis.lines[0]?.score ?? null;
          const choice = chooseMove(
            candidatesFromLines(position, analysis.lines),
            motor,
            bot.estilo,
            Math.random,
            legalUcis(position),
          );
          uci = choice?.move ?? null;
        } else {
          client.setStrength(motor.mode === "elo" ? motor.elo : null);
          const analysis = await client.analyse(position, motor.movetimeMs);
          score = analysis.score;
          uci = analysis.bestMove;
        }
      }
    } catch {
      return; // motor encerrado
    }
    if (run !== generation.current || over.current) return;

    // Avaliação do último lance do aluno e a reação do personagem.
    if (score) {
      botEvalCp.current = scoreToCp(score);
      const last = movesRef.current.at(-1);
      if (last && last.fenAfter === position) {
        last.after = flip(score);
        const loss = moveLoss(last);
        if (loss !== null && loss >= 20) say("erro");
        else if (loss !== null && loss <= 1 && last.played === last.best && Math.random() < 0.35)
          say("bomLance");
      }
    }

    const wait = MIN_THINK_MS - (performance.now() - started);
    if (wait > 0) await sleep(wait);
    if (run !== generation.current || over.current || !uci) return;

    const mover = game.turn();
    try {
      game.move(uciToMove(uci));
    } catch {
      return;
    }
    if (clockOn) clockRef.current[mover] += clockConfig.incMs;
    setThinking(false);
    sync();
    if (!checkEnd()) void playerTurn(run);
  }

  function start() {
    const side: Side =
      colorChoice === "aleatorio" ? (Math.random() < 0.5 ? "w" : "b") : colorChoice;
    generation.current += 1;
    playerSearch.current?.abort();
    chess.current = new Chess();
    movesRef.current = [];
    over.current = false;
    usedUndo.current = false;
    usedHint.current = false;
    pendingHint.current = false;
    botEvalCp.current = null;
    playerRef.current = side;
    clockRef.current = { w: clockConfig.baseMs, b: clockConfig.baseMs };
    setClock({ ...clockRef.current });
    setPlayer(side);
    setHintsLeft(bot.ajudas.dicas);
    setUndosLeft(bot.ajudas.desfazer);
    setLastOfferPly(null);
    setHint(null);
    setOutcome(null);
    setStars(0);
    setAchievementsWon([]);
    setConfirmResign(false);
    setCopied(false);
    setThinking(false);
    engine.current?.newGame();
    setPhase("playing");
    sync();
    say("intro");
    const run = generation.current;
    if (side === "w") void playerTurn(run);
    else void botTurn(run);
  }

  const playerTurnNow =
    phase === "playing" && !thinking && fen.split(" ")[1] === player;

  function onMove(from: Square, to: Square, promotion?: string) {
    if (!playerTurnNow) return false;
    const game = chess.current;
    const fenBefore = game.fen();
    let move;
    try {
      move = game.move({ from, to, promotion });
    } catch {
      return false;
    }
    playerSearch.current?.abort();
    movesRef.current.push({
      ply: game.history().length - 1,
      fenBefore,
      fenAfter: game.fen(),
      played: `${move.from}${move.to}${move.promotion ?? ""}`,
      best: bestForPlayer.current,
      before: beforeScore.current,
      after: null,
    });
    if (clockOn) clockRef.current[move.color] += clockConfig.incMs;
    setHint(null);
    pendingHint.current = false;
    setConfirmResign(false);
    if (move.san.includes("+")) say("xeque");
    else if (move.captured && Math.random() < 0.6) say("captura");
    sync();
    if (!checkEnd()) void botTurn(generation.current);
    return true;
  }

  function undo() {
    const game = chess.current;
    if (phase !== "playing" || undosLeft <= 0 || movesRef.current.length === 0) return;
    generation.current += 1;
    playerSearch.current?.abort();
    setThinking(false);
    let undoneOwn = false;
    while (game.history().length > 0) {
      const undone = game.undo();
      if (undone?.color === playerRef.current) {
        movesRef.current.pop();
        undoneOwn = true;
      }
      if (undoneOwn && game.turn() === playerRef.current) break;
    }
    usedUndo.current = true;
    setUndosLeft((value) => value - 1);
    setHint(null);
    setBubble(null);
    sync();
    void playerTurn(generation.current);
  }

  function takeHint() {
    if (!playerTurnNow || hintsLeft <= 0 || hint) return;
    setHintsLeft((value) => value - 1);
    usedHint.current = true;
    playSound("hint");
    if (bestForPlayer.current) showHintArrow();
    else pendingHint.current = true;
  }

  const plies = history.length;
  const drawAllowed = phase === "playing" && canOfferDraw(plies, lastOfferPly);

  function offerDraw() {
    if (!drawAllowed) return;
    setLastOfferPly(plies);
    if (acceptsDraw(botEvalCp.current, plies)) finish({ result: "empate", reason: "acordo" });
    else
      setBubble({ text: "Prefiro continuar jogando.", expression: "normal", key: Date.now() });
  }

  // Relógio: desconta de quem tem a vez; acabou o tempo, acabou a partida.
  const onTick = useEffectEvent((elapsed: number) => {
    const side = chess.current.turn();
    clockRef.current[side] -= elapsed;
    setClock({ ...clockRef.current });
    if (clockRef.current[side] <= 0)
      finish(timeoutOutcome(chess.current.fen(), side, playerRef.current));
  });
  useEffect(() => {
    if (phase !== "playing" || !clockOn) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      onTick(now - last);
      last = now;
    }, 200);
    return () => window.clearInterval(timer);
  }, [phase, clockOn]);

  // Revisão: setas do teclado andam pelos lances.
  useEffect(() => {
    if (phase !== "review") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setReviewPly((p) => Math.max(0, p - 1));
      if (event.key === "ArrowRight") setReviewPly((p) => Math.min(history.length, p + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, history.length]);

  async function copyPgn() {
    try {
      await navigator.clipboard.writeText(chess.current.pgn());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const marks = new Map(playerMoves.map((m) => [m.ply, markFor(moveLoss(m))]));
  const accuracy = gameAccuracy(playerMoves);
  const errorCount = [...marks.values()].filter((m) => m === "erro" || m === "erro-grave").length;

  // Posição mostrada: na revisão, a do lance escolhido.
  const reviewing = phase === "review";
  const shownFen = reviewing ? (reviewPly === 0 ? START_FEN : history[reviewPly - 1].after) : fen;
  const shownLast = reviewing
    ? reviewPly > 0
      ? { from: history[reviewPly - 1].from, to: history[reviewPly - 1].to }
      : null
    : history.length > 0
      ? { from: history[history.length - 1].from, to: history[history.length - 1].to }
      : null;
  const orientation: Side = phase === "setup" ? (colorChoice === "b" ? "b" : "w") : player;
  const botSide: Side = player === "w" ? "b" : "w";

  if (status === "bloqueado") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-card border border-border bg-surface p-6">
        <BotAvatar id={bot.id} name={bot.nome} size={80} grayscale />
        <h1 className="font-display text-page font-semibold">{bot.nome}</h1>
        <p className="text-muted">
          Este personagem ainda está bloqueado. Vença{" "}
          {BOTS[bot.nivel - 2]?.nome ?? "o nível anterior"} para liberar.
        </p>
        <Link href="/jogar" className={buttonClasses("primary")}>
          Ver a trilha
        </Link>
      </div>
    );
  }

  if (engineState === "error") {
    return (
      <div className="rounded-card border border-border bg-surface p-6">
        <p className="leading-relaxed text-muted">
          Não foi possível carregar o motor de xadrez neste navegador. Tente atualizar o
          navegador ou usar outro aparelho.
        </p>
      </div>
    );
  }

  const expression: Expression = bubble?.expression ?? "normal";

  const header = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <BotAvatar id={bot.id} name={bot.nome} expression={expression} size={56} />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-semibold tracking-wide text-muted uppercase">
            Nível {bot.nivel} · {STYLE_LABELS[bot.estilo]} · ~{bot.eloAprox}
          </span>
          <h1 className="font-display text-xl leading-tight font-semibold">{bot.nome}</h1>
        </div>
        {clockOn && phase !== "setup" && (
          <span
            className={`rounded-control px-2 py-1 font-mono text-lg tabular-nums ${
              phase === "playing" && fen.split(" ")[1] === botSide ? "bg-surface-2 text-text" : "text-muted"
            }`}
            aria-label={`Relógio de ${bot.nome}`}
          >
            {formatClock(clock[botSide])}
          </span>
        )}
      </div>
      <div aria-live="polite" className="min-h-12">
        {bubble && (
          <p
            key={bubble.key}
            className="bubble-in relative rounded-card border bg-surface-2 px-3 py-2 text-[0.9375rem] leading-snug"
            style={{ borderColor: bot.cor }}
          >
            {bubble.text}
          </p>
        )}
      </div>
    </div>
  );

  // Lista de lances (com marcas de erro dos lances do aluno).
  const moveList = (
    <ol className="grid max-h-48 grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 overflow-y-auto text-[0.9375rem] tabular-nums lg:max-h-none">
      {Array.from({ length: Math.ceil(history.length / 2) }, (_, row) => (
        <li key={row} className="contents">
          <span className="text-muted">{row + 1}.</span>
          {[0, 1].map((col) => {
            const ply = row * 2 + col;
            const item = history[ply];
            if (!item) return <span key={col} />;
            const mark = marks.get(ply) ?? null;
            const content: ReactNode = (
              <>
                {item.san}
                {mark && <span className={`ml-0.5 font-semibold ${MARK_CLASS[mark]}`}>{MARK_SYMBOL[mark]}</span>}
              </>
            );
            return reviewing ? (
              <button
                key={col}
                type="button"
                onClick={() => setReviewPly(ply + 1)}
                className={`rounded px-1 text-left ${reviewPly === ply + 1 ? "bg-accent text-on-accent" : "hover:bg-surface-2"}`}
              >
                {content}
              </button>
            ) : (
              <span key={col} className="px-1">
                {content}
              </span>
            );
          })}
        </li>
      ))}
    </ol>
  );

  let body: ReactNode = null;
  let actions: ReactNode = null;

  if (phase === "setup") {
    body = (
      <div className="flex flex-col gap-5">
        <p className="leading-relaxed text-muted">{bot.descricao}</p>
        <Segmented<ColorChoice>
          label="Você joga de"
          value={colorChoice}
          onChange={setColorChoice}
          options={[
            { id: "w", label: "Brancas" },
            { id: "b", label: "Pretas" },
            { id: "aleatorio", label: "Sorteio" },
          ]}
        />
        <Segmented<ClockId>
          label="Relógio"
          value={clockId}
          onChange={setClockId}
          options={CLOCKS.map((item) => ({ id: item.id, label: item.label }))}
        />
        <ul className="flex flex-col gap-1 text-sm text-muted">
          <li>
            Desfazer: {bot.ajudas.desfazer > 0 ? `${bot.ajudas.desfazer} por partida` : "não vale neste nível"}
          </li>
          <li>Dicas: {bot.ajudas.dicas > 0 ? `${bot.ajudas.dicas} por partida` : "não vale neste nível"}</li>
          <li>Estrelas: 1 por vencer, +1 sem desfazer, +1 sem dica.</li>
        </ul>
      </div>
    );
    actions = (
      <>
        <button
          type="button"
          onClick={start}
          disabled={engineState !== "ready" || !ready}
          className={buttonClasses("primary", "md", "flex-1")}
        >
          {engineState === "ready" ? "Começar partida" : "Carregando o motor..."}
        </button>
        <Link href="/jogar" className={buttonClasses("ghost")}>
          Trilha
        </Link>
      </>
    );
  } else if (phase === "playing") {
    const statusText = thinking
      ? `${bot.nome} está pensando...`
      : fen.split(" ")[1] === player
        ? "Sua vez."
        : "";
    body = (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium" aria-live="polite">
            {statusText}
          </p>
          {clockOn && (
            <span
              className={`rounded-control px-2 py-1 font-mono text-lg tabular-nums ${
                fen.split(" ")[1] === player ? "bg-surface-2 text-text" : "text-muted"
              }`}
              aria-label="Seu relógio"
            >
              {formatClock(clock[player])}
            </span>
          )}
        </div>
        {moveList}
      </div>
    );
    actions = confirmResign ? (
      <>
        <button type="button" onClick={() => finish({ result: "derrota", reason: "abandono" })} className={buttonClasses("primary", "md", "flex-1")}>
          Sim, abandonar
        </button>
        <button type="button" onClick={() => setConfirmResign(false)} className={buttonClasses("ghost")}>
          Continuar
        </button>
      </>
    ) : (
      <>
        {bot.ajudas.dicas > 0 && (
          <button
            type="button"
            onClick={takeHint}
            disabled={!playerTurnNow || hintsLeft <= 0 || Boolean(hint)}
            className={buttonClasses("secondary")}
          >
            Dica ({hintsLeft})
          </button>
        )}
        {bot.ajudas.desfazer > 0 && (
          <button
            type="button"
            onClick={undo}
            disabled={undosLeft <= 0 || playerMoves.length === 0}
            className={buttonClasses("secondary")}
          >
            Desfazer ({undosLeft})
          </button>
        )}
        <button type="button" onClick={offerDraw} disabled={!drawAllowed} className={buttonClasses("secondary")}>
          Empate
        </button>
        <button type="button" onClick={() => setConfirmResign(true)} className={buttonClasses("ghost")}>
          Abandonar
        </button>
      </>
    );
  } else if (phase === "over" && outcome) {
    body = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p
            className={`font-display text-2xl font-semibold ${
              outcome.result === "vitoria" ? "text-success" : outcome.result === "derrota" ? "text-danger" : "text-text"
            }`}
          >
            {RESULT_TITLE[outcome.result]}
          </p>
          <p className="text-sm text-muted">{END_TEXT[outcome.reason]}</p>
          {outcome.result === "vitoria" && <Stars count={stars} className="text-2xl" />}
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-control bg-surface-2 p-2">
            <dt className="text-xs text-muted">Lances</dt>
            <dd className="text-lg font-semibold tabular-nums">{Math.ceil(plies / 2)}</dd>
          </div>
          <div className="rounded-control bg-surface-2 p-2">
            <dt className="text-xs text-muted">Precisão</dt>
            <dd className="text-lg font-semibold tabular-nums">{accuracy === null ? "—" : `~${accuracy}%`}</dd>
          </div>
          <div className="rounded-control bg-surface-2 p-2">
            <dt className="text-xs text-muted">Erros</dt>
            <dd className="text-lg font-semibold tabular-nums">{errorCount}</dd>
          </div>
        </dl>
        {achievementsWon.length > 0 && (
          <ul className="flex flex-col gap-2">
            {achievementsWon.map((item) => (
              <li key={item.id} className="rounded-control border border-accent bg-surface-2 px-3 py-2 text-sm">
                <span className="font-semibold">🏅 Conquista: {item.title}.</span> {item.text}
              </li>
            ))}
          </ul>
        )}
        {!loggedIn && (
          <p className="text-sm text-muted">
            O progresso fica neste aparelho.{" "}
            <Link href="/entrar?next=/jogar" className="font-semibold text-accent-text hover:underline">
              Crie uma conta
            </Link>{" "}
            para guardar.
          </p>
        )}
      </div>
    );
    actions = (
      <>
        {outcome.result === "vitoria" && next ? (
          <Link href={`/jogar/${next.id}`} className={buttonClasses("primary", "md", "flex-1")}>
            Próximo nível
          </Link>
        ) : null}
        <button
          type="button"
          onClick={start}
          className={buttonClasses(outcome.result === "vitoria" && next ? "secondary" : "primary", "md", "flex-1")}
        >
          Jogar de novo
        </button>
        <button
          type="button"
          onClick={() => {
            setReviewPly(history.length);
            setPhase("review");
          }}
          className={buttonClasses("secondary")}
        >
          Revisar partida
        </button>
        <Link href="/jogar" className={buttonClasses("ghost")}>
          Trilha
        </Link>
      </>
    );
  } else if (phase === "review") {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Toque num lance ou use as setas. Os seus lances marcados com ?!, ? e ?? foram
          imprecisões, erros e erros graves (avaliação aproximada).
        </p>
        {moveList}
      </div>
    );
    actions = (
      <>
        <button
          type="button"
          onClick={() => setReviewPly((p) => Math.max(0, p - 1))}
          disabled={reviewPly === 0}
          className={buttonClasses("secondary")}
          aria-label="Lance anterior"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => setReviewPly((p) => Math.min(history.length, p + 1))}
          disabled={reviewPly === history.length}
          className={buttonClasses("secondary")}
          aria-label="Próximo lance"
        >
          →
        </button>
        <button type="button" onClick={copyPgn} className={buttonClasses("secondary")}>
          {copied ? "PGN copiado" : "Copiar PGN"}
        </button>
        <button type="button" onClick={() => setPhase("over")} className={buttonClasses("ghost")}>
          Voltar
        </button>
      </>
    );
  }

  return (
    <BoardStage
      board={
        <ChessBoard
          id="finale-jogar"
          fen={shownFen}
          orientation={orientation}
          movableColor={playerTurnNow ? player : null}
          lastMove={shownLast}
          arrows={hint && !reviewing ? [hint] : []}
          soundMode={reviewing ? "replay" : "jogo"}
          onMove={onMove}
        />
      }
      info={header}
      actions={<div className="flex w-full flex-wrap gap-2">{actions}</div>}
      below={
        loggedIn && reviewing ? (
          <p className="text-sm text-muted">
            Quer a análise completa, lance a lance? Copie o PGN e cole na{" "}
            <Link href="/analise" className="font-semibold text-accent-text hover:underline">
              Análise de partidas
            </Link>
            .
          </p>
        ) : null
      }
    >
      {body}
    </BoardStage>
  );
}
