"use client";

import type { MoveClass } from "@/lib/analysis/classify";
import { winChance, type EngineScore } from "@/lib/analysis/winprob";
import { CLASS_COLOR } from "./MoveClassIcon";

const WIDTH = 600;
const HEIGHT = 120;

export type GraphMark = { index: number; cls: MoveClass | "momento" };

// Gráfico da chance das brancas ao longo da partida (branco em cima, preto
// embaixo). Clicar leva ao lance; marcadores nos momentos-chave, brilhantes e
// erros graves.
export function EvalGraph({
  evals,
  total,
  current,
  marks,
  onSelect,
}: {
  evals: EngineScore[];
  total: number; // posições da partida (o gráfico cresce durante a análise)
  current: number; // posição mostrada (0 = início)
  marks: GraphMark[];
  onSelect: (index: number) => void;
}) {
  if (total < 2) return null;
  const step = WIDTH / (total - 1);
  const points = evals.map((score, i) => ({
    x: i * step,
    y: HEIGHT - (winChance(score) / 100) * HEIGHT,
  }));
  const line = points
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const lastX = points.length ? points[points.length - 1].x : 0;
  const area = points.length
    ? `0,${HEIGHT} ${line} ${lastX.toFixed(1)},${HEIGHT}`
    : "";

  function pick(clientX: number, box: DOMRect) {
    const ratio = (clientX - box.left) / box.width;
    const index = Math.round(ratio * (total - 1));
    onSelect(Math.max(0, Math.min(evals.length - 1, index)));
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-16 w-full shrink-0 cursor-pointer rounded-control border border-border bg-eval-dark lg:h-14"
      onClick={(event) =>
        pick(event.clientX, event.currentTarget.getBoundingClientRect())
      }
      role="img"
      aria-label="Gráfico da avaliação ao longo da partida. Clique para ir ao lance; use as setas do teclado para navegar."
    >
      {area && <polygon points={area} fill="var(--color-eval-light)" />}
      <line
        x1={0}
        x2={WIDTH}
        y1={HEIGHT / 2}
        y2={HEIGHT / 2}
        stroke="rgb(128 128 128 / 0.6)"
        strokeDasharray="4 4"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={current * step}
        x2={current * step}
        y1={0}
        y2={HEIGHT}
        stroke="var(--accent)"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      {marks.map((mark) => {
        const point = points[mark.index];
        if (!point) return null;
        return (
          <line
            key={`${mark.cls}-${mark.index}`}
            x1={point.x}
            x2={point.x}
            y1={point.y - 7}
            y2={point.y + 7}
            stroke={
              mark.cls === "momento" ? "var(--accent-2)" : CLASS_COLOR[mark.cls]
            }
            strokeWidth={6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}
