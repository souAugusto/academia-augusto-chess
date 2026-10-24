"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BoardStage } from "@/components/chess/BoardStage";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { buttonClasses } from "@/components/ui/button";
import { botById } from "@/content/personagens";
import { gameFromUcis } from "@/lib/analysis/pgn";
import { END_TEXT } from "@/lib/bot/game";
import { CODE_MARKS, gamePgn, type BotGameRecord } from "@/lib/bot/history";
import type { MoveMark } from "@/lib/bot/review";
import { formatDate } from "@/lib/format";
import { BotAvatar } from "./BotAvatar";
import { Stars } from "./BotTrail";
import { MoveList } from "./MoveList";
import { readLocalGames } from "./useBotProgress";

const RESULT_TITLE = { vitoria: "Vitória", derrota: "Derrota", empate: "Empate" } as const;
const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Revisão de uma partida do histórico. `game` vem do servidor (com conta);
// visitante: a partida é procurada no aparelho pelo id.
export function BotGameReplay({
  id,
  game: serverGame,
  loggedIn,
}: {
  id: string;
  game: BotGameRecord | null;
  loggedIn: boolean;
}) {
  const [localGame, setLocalGame] = useState<BotGameRecord | null | undefined>(undefined);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lido do aparelho depois da montagem
    if (!loggedIn) setLocalGame(readLocalGames().find((item) => item.id === id) ?? null);
  }, [id, loggedIn]);
  const game = loggedIn ? serverGame : localGame;

  const replay = useMemo(() => (game && game.moves.length > 0 ? gameFromUcis(game.moves) : null), [game]);
  const total = replay?.sans.length ?? 0;
  const [ply, setPly] = useState<number | null>(null);
  const shown = ply ?? total; // abre na posição final
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") setPly((p) => Math.max(0, (p ?? total) - 1));
      if (event.key === "ArrowRight") setPly((p) => Math.min(total, (p ?? total) + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  if (game === undefined) return null;
  const bot = game ? botById(game.botId) : undefined;
  if (!game || !bot)
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted">
          Partida não encontrada.
          {!loggedIn && " Sem conta, as partidas ficam só no aparelho em que foram jogadas."}
        </p>
        <Link href="/jogar/partidas" className={buttonClasses("primary")}>
          Minhas partidas
        </Link>
      </div>
    );

  const marks = new Map<number, MoveMark>(game.marks.map(([p, code]) => [p, CODE_MARKS[code]]));
  const fen = replay?.fens[shown] ?? START_FEN;
  const last = replay && shown > 0 ? replay.ucis[shown - 1] : null;

  async function copyPgn() {
    try {
      await navigator.clipboard.writeText(gamePgn(game!, bot!.nome));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <BoardStage
      board={
        <ChessBoard
          id="finale-partida-robo"
          fen={fen}
          orientation={game.color}
          movableColor={null}
          lastMove={last ? { from: last.slice(0, 2), to: last.slice(2, 4) } : null}
          soundMode="replay"
          onMove={() => false}
        />
      }
      info={
        <div className="flex items-center gap-3">
          <BotAvatar
            id={bot.id}
            name={bot.nome}
            size={56}
            expression={game.result === "vitoria" ? "preocupado" : game.result === "derrota" ? "feliz" : "normal"}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-semibold tracking-wide text-muted uppercase">
              {formatDate(game.playedAt)} · {game.color === "w" ? "Brancas" : "Pretas"}
            </span>
            <h1 className="font-display text-xl leading-tight font-semibold">
              {RESULT_TITLE[game.result]} contra {bot.nome}
            </h1>
            <span className="flex flex-wrap items-center gap-x-2 text-sm text-muted">
              {END_TEXT[game.reason]}
              {game.accuracy !== null && ` · precisão ~${game.accuracy}%`}
              {game.result === "vitoria" && <Stars count={game.stars} />}
            </span>
          </div>
        </div>
      }
      actions={
        <div className="flex w-full flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPly(Math.max(0, shown - 1))}
            disabled={shown === 0}
            className={buttonClasses("secondary")}
            aria-label="Lance anterior"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setPly(Math.min(total, shown + 1))}
            disabled={shown === total}
            className={buttonClasses("secondary")}
            aria-label="Próximo lance"
          >
            →
          </button>
          <button type="button" onClick={copyPgn} className={buttonClasses("secondary")}>
            {copied ? "PGN copiado" : "Copiar PGN"}
          </button>
          {loggedIn && total > 0 && (
            <Link href={`/analise?robo=${game.id}`} className={buttonClasses("primary")}>
              Analisar a fundo
            </Link>
          )}
          <Link href={`/jogar/${bot.id}`} className={buttonClasses("ghost")}>
            Revanche
          </Link>
        </div>
      }
      below={
        !loggedIn ? (
          <p className="text-sm text-muted">
            Sem conta, as partidas ficam só neste aparelho (as últimas 20).{" "}
            <Link href="/entrar?next=/jogar/partidas" className="font-semibold text-accent-text hover:underline">
              Entre
            </Link>{" "}
            para guardar na sua conta e analisar a fundo.
          </p>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Toque num lance ou use as setas. Os seus lances marcados com ?!, ? e ?? foram
          imprecisões, erros e erros graves (avaliação aproximada).
        </p>
        {total > 0 ? (
          <MoveList sans={replay!.sans} marks={marks} current={shown} onSelect={setPly} />
        ) : (
          <p className="text-muted">A partida terminou antes do primeiro lance.</p>
        )}
      </div>
    </BoardStage>
  );
}
