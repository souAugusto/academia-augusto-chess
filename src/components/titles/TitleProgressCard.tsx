import Link from "next/link";
import { RATING_DISCLAIMER } from "@/content/titulos";
import type { TitleSummary } from "@/lib/data/titles";
import { TitleBadge } from "./TitleBadge";

const number = (value: number) => value.toLocaleString("pt-BR");

// Título atual + "faltam X para o próximo" (ou "calibrando") + aviso do rating.
export function TitleProgressCard({
  summary,
  links = true,
}: {
  summary: TitleSummary;
  links?: boolean;
}) {
  const { current, progress, rating } = summary;
  let line: React.ReactNode;
  let percent = 100;
  if (progress.kind === "calibrando") {
    percent = Math.round((progress.games / progress.needed) * 100);
    line = (
      <>
        Calibrando: {progress.games} de {progress.needed} puzzles. O primeiro
        título sai ao completar {progress.needed}.
      </>
    );
  } else if (progress.kind === "proximo") {
    percent = progress.percent;
    line = (
      <>
        Rating tático {number(rating)} · faltam {number(progress.missing)} para{" "}
        <strong className="text-text">{progress.next.name}</strong>
      </>
    );
  } else {
    line = <>Rating tático {number(rating)} · topo da escada de títulos.</>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {current ? (
          <TitleBadge name={current.name} color={current.color} size="md" />
        ) : (
          <span className="text-sm text-muted">Ainda sem título</span>
        )}
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          progress.kind === "calibrando"
            ? "Puzzles da calibragem"
            : "Progresso até o próximo título"
        }
      >
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[0.9375rem] text-muted">{line}</p>
      <p className="rounded-control border border-border bg-surface-2 px-3 py-2 text-[0.8125rem] leading-relaxed text-muted">
        {RATING_DISCLAIMER}
      </p>
      {links && (
        <div className="flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/titulos" className="text-accent-text hover:underline">
            Ver todos os títulos
          </Link>
          <Link href="/comunidade" className="text-accent-text hover:underline">
            Ranking da academia
          </Link>
        </div>
      )}
    </div>
  );
}
