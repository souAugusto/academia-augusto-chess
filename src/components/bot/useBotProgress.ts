"use client";

import { useCallback, useEffect, useState } from "react";
import { mergeBotGames, mergeBotProgress, saveBotGame } from "@/app/(jogo)/jogar/actions";
import { BOTS } from "@/content/personagens";
import {
  addLocalGame,
  parseLocalGames,
  STORAGE_GAMES,
  type BotGameRecord,
} from "@/lib/bot/history";
import {
  mergeProgress,
  newAchievements,
  parseProgress,
  recordGame,
  STORAGE_PROGRESS,
  type Achievement,
  type Progress,
} from "@/lib/bot/progress";

export const BOT_ORDER = BOTS.map((bot) => bot.id);

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sem armazenamento (modo privado): vale só nesta visita.
  }
}

const readLocalProgress = (): Progress | null => {
  const raw = readJson(STORAGE_PROGRESS);
  return raw ? parseProgress(raw, BOT_ORDER) : null;
};

export const readLocalGames = (): BotGameRecord[] =>
  parseLocalGames(readJson(STORAGE_GAMES), BOT_ORDER);

// Progresso e histórico da trilha. Visitante: guardados no aparelho. Com
// conta: no banco; o que havia no aparelho antes do login é juntado à conta.
export function useBotProgress(loggedIn: boolean, serverProgress: Progress) {
  const [progress, setProgress] = useState<Progress>(serverProgress);
  const [ready, setReady] = useState(loggedIn);

  useEffect(() => {
    const local = readLocalProgress();
    if (!loggedIn) {
      // Lido depois da montagem: o servidor não conhece o aparelho.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o armazenamento do aparelho
      if (local) setProgress(local);
      setReady(true);
      return;
    }
    if (local && Object.keys(local).length > 0) {
      setProgress((current) => mergeProgress(current, local));
      void mergeBotProgress(local).then((result) => {
        if (result.ok) writeJson(STORAGE_PROGRESS, null);
      });
    }
    const games = readLocalGames();
    if (games.length > 0)
      void mergeBotGames(games).then((result) => {
        if (result.ok) writeJson(STORAGE_GAMES, null);
      });
  }, [loggedIn]);

  // Registra o fim de uma partida. Devolve as conquistas novas.
  const record = useCallback(
    (game: BotGameRecord): Achievement[] => {
      const next = recordGame(progress, game.botId, game.result, game.stars);
      setProgress(next);
      if (loggedIn) void saveBotGame(game);
      else {
        writeJson(STORAGE_PROGRESS, next);
        writeJson(STORAGE_GAMES, addLocalGame(readLocalGames(), game));
      }
      return newAchievements(BOT_ORDER, progress, next);
    },
    [loggedIn, progress],
  );

  return { progress, ready, record };
}
