"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BoardStage } from "@/components/chess/BoardStage";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { buttonClasses } from "@/components/ui/button";
import { sanToPortuguese } from "@/lib/chess/notation";
import { formatMark, parseLessonPgn, plyAtTime } from "@/lib/video/sync";

// Tabuleiro sincronizado com o vídeo da aula (YouTube). As marcações de tempo
// ficam no PGN, como {[%t 1:23]} depois do lance.

type YTPlayer = {
  getCurrentTime(): number;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  destroy(): void;
};
type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host?: string;
      videoId: string;
      playerVars?: Record<string, number>;
      events?: { onReady?: () => void };
    },
  ) => YTPlayer;
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_URL = "https://www.youtube.com/iframe_api";

// Carrega a API oficial do YouTube uma vez só.
function loadYouTube(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.querySelector(`script[src="${API_URL}"]`)) {
      const script = document.createElement("script");
      script.src = API_URL;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

type LessonSyncProps = {
  videoId: string | null;
  pgn: string;
  fen: string | null;
  title: string;
  info: ReactNode;
  actions: ReactNode;
};

export function LessonSync({
  videoId,
  pgn,
  fen,
  title,
  info,
  actions,
}: LessonSyncProps) {
  const lesson = useMemo(() => parseLessonPgn(pgn, fen), [pgn, fen]);
  const plies = useMemo(() => lesson?.plies ?? [], [lesson]);
  const [ply, setPly] = useState(0);
  const [follow, setFollow] = useState(true);
  const playerBox = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const followRef = useRef(follow);

  useEffect(() => {
    followRef.current = follow;
  }, [follow]);

  // Cria o player e acompanha o tempo do vídeo.
  useEffect(() => {
    if (!videoId || !playerBox.current) return;
    let cancelled = false;
    let poll = 0;
    // O YouTube troca o elemento pelo iframe dele: usa um filho criado aqui,
    // fora do controle do React.
    const box = playerBox.current;
    const target = document.createElement("div");
    target.className = "size-full";
    box.appendChild(target);
    void loadYouTube().then((YT) => {
      if (cancelled) return;
      player.current = new YT.Player(target, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      });
      poll = window.setInterval(() => {
        const time = player.current?.getCurrentTime?.();
        if (typeof time === "number" && followRef.current)
          setPly(plyAtTime(plies, time));
      }, 500);
    });
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      player.current?.destroy();
      player.current = null;
      box.replaceChildren();
    };
  }, [videoId, plies]);

  if (!lesson) return null;
  const current = plies[ply] ?? plies[0];
  const last = current.from && current.to ? [current.from, current.to] : [];

  function goTo(index: number, seek: boolean) {
    const target = plies[Math.max(0, Math.min(index, plies.length - 1))];
    setPly(target.ply);
    if (seek && target.seconds !== null && player.current) {
      player.current.seekTo(target.seconds, true);
      setFollow(true);
    } else {
      setFollow(false);
    }
  }

  // Lances agrupados por número: 1. e4 e5
  const rows: { number: number; plies: typeof plies }[] = [];
  for (const item of plies.slice(1)) {
    const number = Math.ceil(item.ply / 2);
    const row = rows.at(-1);
    if (row && row.number === number) row.plies.push(item);
    else rows.push({ number, plies: [item] });
  }

  return (
    <BoardStage
      variant="lesson"
      board={
        <StaticBoard
          fen={current.fen}
          orientation="w"
          highlight={last}
          label={`Posição da aula ${title}, lance ${current.ply}`}
        />
      }
      info={info}
      actions={actions}
    >
      <div className="aspect-video overflow-hidden rounded-card border border-border bg-surface">
        {videoId ? (
          <div
            ref={playerBox}
            className="size-full [&_iframe]:size-full"
            aria-label={`Vídeo: ${title}`}
          />
        ) : (
          <div className="flex size-full items-center justify-center p-6 text-center text-muted">
            O vídeo desta aula ainda não foi publicado.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => goTo(ply - 1, false)}
          disabled={ply === 0}
          className={buttonClasses("secondary")}
        >
          Voltar lance
        </button>
        <button
          type="button"
          onClick={() => goTo(ply + 1, false)}
          disabled={ply >= plies.length - 1}
          className={buttonClasses("secondary")}
        >
          Avançar lance
        </button>
        {lesson.hasMarks && !follow && videoId && (
          <button
            type="button"
            onClick={() => setFollow(true)}
            className={buttonClasses("ghost")}
          >
            Seguir o vídeo
          </button>
        )}
      </div>

      {current.comment && (
        <p aria-live="polite" className="leading-relaxed">
          {current.comment}
        </p>
      )}

      <ol
        className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm"
        aria-label="Lances da aula"
      >
        {rows.map((row) => (
          <li key={row.number} className="flex items-center gap-1">
            <span className="text-muted">{row.number}.</span>
            {row.plies.map((item) => (
              <button
                key={item.ply}
                type="button"
                onClick={() => goTo(item.ply, true)}
                aria-current={item.ply === ply ? "step" : undefined}
                className={`rounded px-1.5 py-0.5 transition ${
                  item.ply === ply
                    ? "bg-accent text-on-accent"
                    : "hover:bg-surface-2"
                }`}
              >
                {sanToPortuguese(item.san ?? "")}
                {item.seconds !== null && (
                  <span
                    className={`ml-1 text-[0.6875rem] ${item.ply === ply ? "" : "text-muted"}`}
                  >
                    {formatMark(item.seconds)}
                  </span>
                )}
              </button>
            ))}
          </li>
        ))}
      </ol>
    </BoardStage>
  );
}
