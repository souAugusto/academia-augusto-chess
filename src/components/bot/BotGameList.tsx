"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { botById } from "@/content/personagens";
import type { BotGameRecord } from "@/lib/bot/history";
import { formatDate } from "@/lib/format";
import { BotAvatar } from "./BotAvatar";
import { Stars } from "./BotTrail";
import { readLocalGames } from "./useBotProgress";

const RESULT = {
  vitoria: { label: "Vitória", className: "text-success" },
  derrota: { label: "Derrota", className: "text-danger" },
  empate: { label: "Empate", className: "text-muted" },
} as const;

// Lista de partidas. `games` vem do servidor (com conta); null = visitante,
// e a lista é lida do aparelho.
export function BotGameList({
  games,
  limit,
}: {
  games: BotGameRecord[] | null;
  limit?: number;
}) {
  const [local, setLocal] = useState<BotGameRecord[] | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lido do aparelho depois da montagem
    if (games === null) setLocal(readLocalGames());
  }, [games]);

  const list = (games ?? local ?? []).slice(0, limit);
  if (games === null && local === null) return null;
  if (list.length === 0)
    return <p className="text-muted">Nenhuma partida ainda. Escolha um personagem e jogue a primeira.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {list.map((game) => {
        const bot = botById(game.botId);
        if (!bot) return null;
        const result = RESULT[game.result];
        return (
          <li key={game.id}>
            <Link
              href={`/jogar/partidas/${game.id}`}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 transition hover:border-accent"
            >
              <BotAvatar id={bot.id} name={bot.nome} size={44} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{bot.nome}</span>
                <span className="text-sm text-muted">
                  {formatDate(game.playedAt)} · {game.color === "w" ? "Brancas" : "Pretas"} ·{" "}
                  {Math.ceil(game.moves.length / 2)} lances
                  {game.accuracy !== null ? ` · ~${game.accuracy}%` : ""}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end text-sm">
                <span className={`font-semibold ${result.className}`}>{result.label}</span>
                {game.result === "vitoria" && <Stars count={game.stars} />}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
