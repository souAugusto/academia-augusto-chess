"use client";

import Link from "next/link";
import { BOTS } from "@/content/personagens";
import {
  achievements,
  bestResult,
  botStatus,
  totalStars,
  type Progress,
} from "@/lib/bot/progress";
import { IconLock } from "@/components/ui/icons";
import { BotAvatar } from "./BotAvatar";
import { BOT_ORDER, useBotProgress } from "./useBotProgress";

export const STYLE_LABELS = {
  agressivo: "Agressivo",
  defensivo: "Defensivo",
  posicional: "Posicional",
  tatico: "Tático",
} as const;

const RESULT_LABELS = { vitoria: "Venceu", empate: "Empatou", derrota: "Perdeu" } as const;

export function Stars({ count, className = "" }: { count: number; className?: string }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${count} de 3 estrelas`}>
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden="true" className={i < count ? "text-accent" : "text-border-strong"}>
          ★
        </span>
      ))}
    </span>
  );
}

// Trilha dos 10 personagens: bloqueado, disponível ou vencido, com estrelas e
// melhor resultado. O próximo nível libera ao vencer o anterior.
export function BotTrail({
  loggedIn,
  serverProgress,
}: {
  loggedIn: boolean;
  serverProgress: Progress;
}) {
  const { progress, ready } = useBotProgress(loggedIn, serverProgress);
  const stars = totalStars(progress);
  const earned = achievements(BOT_ORDER, progress);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <span>
          <span className="font-semibold text-text tabular-nums">{stars}</span> de{" "}
          {BOTS.length * 3} estrelas
        </span>
        <span>
          <span className="font-semibold text-text tabular-nums">{earned.length}</span>{" "}
          {earned.length === 1 ? "conquista" : "conquistas"}
        </span>
        {!loggedIn && (
          <span>
            Seu progresso fica neste aparelho.{" "}
            <Link href="/entrar?next=/jogar" className="font-semibold text-accent-text hover:underline">
              Entre
            </Link>{" "}
            para guardar na sua conta.
          </span>
        )}
      </div>

      <ol className="relative flex flex-col gap-4 before:absolute before:top-8 before:bottom-8 before:left-[2.4rem] before:w-0.5 before:bg-border sm:before:left-[2.9rem]">
        {BOTS.map((bot) => {
          const status = ready ? botStatus(BOT_ORDER, progress, bot.id) : "bloqueado";
          const record = progress[bot.id];
          const best = bestResult(record);
          const locked = status === "bloqueado";
          const content = (
            <>
              <BotAvatar
                id={bot.id}
                name={bot.nome}
                size={64}
                grayscale={locked}
                className="ring-4 ring-bg sm:size-20"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Nível {bot.nivel}
                  {bot.chefe ? " · Chefe" : ""} · {STYLE_LABELS[bot.estilo]} · ~{bot.eloAprox}
                </span>
                <span className="font-display text-lg leading-tight font-semibold">{bot.nome}</span>
                <span className="text-sm text-muted">
                  {locked ? `Vença ${BOTS[bot.nivel - 2]?.nome ?? "o nível anterior"} para liberar.` : bot.titulo}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                {locked ? (
                  <IconLock className="size-5 text-muted" />
                ) : (
                  <>
                    <Stars count={record?.estrelas ?? 0} className="text-base" />
                    <span className={best === "vitoria" ? "text-success" : "text-muted"}>
                      {best ? RESULT_LABELS[best] : "Novo"}
                    </span>
                  </>
                )}
              </div>
            </>
          );
          return (
            <li key={bot.id} className="relative">
              {locked ? (
                <div
                  aria-disabled="true"
                  className="flex items-center gap-4 rounded-card border border-border bg-surface/60 p-4 opacity-80"
                >
                  {content}
                </div>
              ) : (
                <Link
                  href={`/jogar/${bot.id}`}
                  className="flex items-center gap-4 rounded-card border bg-surface p-4 shadow-card transition hover:border-accent"
                  style={{ borderColor: status === "disponivel" ? bot.cor : undefined }}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {earned.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-semibold">Conquistas</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {earned.map((item) => (
              <li key={item.id} className="rounded-card border border-border bg-surface p-4">
                <p className="font-semibold">🏅 {item.title}</p>
                <p className="text-sm text-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
