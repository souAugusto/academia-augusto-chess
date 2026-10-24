"use client";

import { useCallback, useEffect, useState } from "react";
import { mergeBotProgress, recordBotGame } from "@/app/(jogo)/jogar/actions";
import { BOTS } from "@/content/personagens";
import type { Result } from "@/lib/bot/game";
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

function readLocal(): Progress | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PROGRESS);
    return raw ? parseProgress(JSON.parse(raw), BOT_ORDER) : null;
  } catch {
    return null;
  }
}

function writeLocal(progress: Progress | null) {
  try {
    if (progress) window.localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
    else window.localStorage.removeItem(STORAGE_PROGRESS);
  } catch {
    // Sem armazenamento (modo privado): o progresso vale só nesta visita.
  }
}

// Progresso na trilha. Visitante: guardado no aparelho. Com conta: no banco;
// se houver progresso de antes do login no aparelho, ele é juntado à conta.
export function useBotProgress(loggedIn: boolean, serverProgress: Progress) {
  const [progress, setProgress] = useState<Progress>(serverProgress);
  const [ready, setReady] = useState(loggedIn);

  useEffect(() => {
    const local = readLocal();
    if (!loggedIn) {
      // Lido depois da montagem: o servidor não conhece o aparelho.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza com o armazenamento do aparelho
      if (local) setProgress(local);
      setReady(true);
      return;
    }
    if (!local || Object.keys(local).length === 0) return;
    setProgress((current) => mergeProgress(current, local));
    void mergeBotProgress(local).then((result) => {
      if (result.ok) writeLocal(null);
    });
  }, [loggedIn]);

  // Registra o fim de uma partida. Devolve as conquistas novas.
  const record = useCallback(
    (botId: string, result: Result, stars: number): Achievement[] => {
      const next = recordGame(progress, botId, result, stars);
      setProgress(next);
      if (loggedIn) void recordBotGame({ botId, result, stars });
      else writeLocal(next);
      return newAchievements(BOT_ORDER, progress, next);
    },
    [loggedIn, progress],
  );

  return { progress, ready, record };
}
