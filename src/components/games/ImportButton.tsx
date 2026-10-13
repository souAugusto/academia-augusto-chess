"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  finishImport,
  importChessComMonth,
  importLichess,
  startImport,
  type StepResult,
} from "@/app/(app)/partidas/actions";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import type { Platform } from "@/lib/games/normalize";

const STEP_PAUSE_MS = 700; // intervalo entre requisições (respeito às APIs)
const RATE_LIMIT_WAIT_S = 60; // espera quando a plataforma responde 429
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Status =
  | { kind: "idle" }
  | {
      kind: "running";
      done: number;
      total: number | null;
      saved: number;
      note?: string;
    }
  | { kind: "done"; saved: number }
  | { kind: "error"; message: string };

// Importação conduzida pelo navegador, em passos curtos: a tela não trava e
// nenhuma chamada passa do tempo limite do servidor.
export function ImportButton({
  platform,
  firstTime,
}: {
  platform: Platform;
  firstTime: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const cancelled = useRef(false);

  // Repete o passo quando a plataforma pede para esperar (429).
  async function withRetry(
    step: () => Promise<StepResult>,
    progress: { done: number; total: number | null; saved: number },
  ): Promise<StepResult> {
    for (let attempt = 0; ; attempt++) {
      const result = await step();
      if (result.ok || !result.retry || attempt >= MAX_RETRIES) return result;
      for (let left = RATE_LIMIT_WAIT_S; left > 0; left--) {
        if (cancelled.current) return result;
        setStatus({
          kind: "running",
          ...progress,
          note: `A plataforma pediu uma pausa. Continuando em ${left}s...`,
        });
        await sleep(1000);
      }
    }
  }

  async function run() {
    cancelled.current = false;
    setStatus({ kind: "running", done: 0, total: null, saved: 0 });
    const plan = await startImport(platform);
    if (!plan.ok) {
      setStatus({ kind: "error", message: plan.error });
      return;
    }

    let saved = 0;
    let budget = plan.budget;
    if (plan.platform === "lichess") {
      const result = await withRetry(
        () => importLichess({ sinceMs: plan.sinceMs }),
        { done: 0, total: null, saved },
      );
      if (!result.ok) {
        setStatus({ kind: "error", message: result.error });
        return;
      }
      saved = result.saved;
    } else {
      const total = plan.archives.length;
      for (let index = 0; index < total && budget > 0; index++) {
        if (cancelled.current) break;
        setStatus({ kind: "running", done: index, total, saved });
        const result = await withRetry(
          () =>
            importChessComMonth({
              url: plan.archives[index],
              budget,
              sinceMs: plan.sinceMs,
            }),
          { done: index, total, saved },
        );
        if (!result.ok) {
          // Guarda o que já veio e avisa; o resto vem na próxima atualização.
          await finishImport(platform);
          setStatus({
            kind: "error",
            message: `${result.error} ${saved} partidas foram salvas até aqui.`,
          });
          router.refresh();
          return;
        }
        saved += result.saved;
        budget -= result.fetched;
        await sleep(STEP_PAUSE_MS);
      }
    }

    await finishImport(platform);
    setStatus({ kind: "done", saved });
    router.refresh();
  }

  const running = status.kind === "running";
  const percent =
    running && status.total
      ? Math.round((status.done / status.total) * 100)
      : null;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={run}
        disabled={running}
        className={buttonClasses(firstTime ? "primary" : "secondary")}
      >
        {running
          ? "Importando..."
          : firstTime
            ? "Importar partidas"
            : "Atualizar partidas"}
      </button>

      {running && (
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <div
            role="progressbar"
            aria-label="Progresso da importação"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent ?? undefined}
            className="h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className={`h-full rounded-full bg-accent transition-[width] ${percent === null ? "w-1/3 animate-pulse" : ""}`}
              style={percent === null ? undefined : { width: `${percent}%` }}
            />
          </div>
          <span className="text-sm text-muted">
            {status.note ??
              (status.total
                ? `Mês ${status.done + 1} de ${status.total} · ${status.saved} partidas novas`
                : "Buscando partidas...")}
          </span>
        </div>
      )}
      {status.kind === "done" && (
        <FormAlert tone="sucesso">
          {status.saved > 0
            ? `${status.saved} partidas novas importadas.`
            : "Nenhuma partida nova desde a última importação."}
        </FormAlert>
      )}
      {status.kind === "error" && (
        <FormAlert tone="erro">{status.message}</FormAlert>
      )}
    </div>
  );
}
