"use client";

import { winChance, type EngineScore } from "@/lib/analysis/winprob";

const WIDTH = 600;
const HEIGHT = 120;

// Gráfico da chance das brancas ao longo da partida. Clicar leva ao lance.
export function EvalGraph({
  evals,
  current,
  marks,
  onSelect,
}: {
  evals: EngineScore[];
  current: number; // posição mostrada (0 = início)
  marks: number[]; // posições com momentos críticos
  onSelect: (index: number) => void;
}) {
  if (evals.length < 2) return null;
  const step = WIDTH / (evals.length - 1);
  const points = evals.map((score, i) => ({
    x: i * step,
    y: HEIGHT - (winChance(score) / 100) * HEIGHT,
  }));
  const line = points
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}`;

  function pick(event: React.MouseEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    onSelect(
      Math.max(
        0,
        Math.min(evals.length - 1, Math.round(ratio * (evals.length - 1))),
      ),
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-28 w-full cursor-pointer rounded-control border border-border bg-eval-dark"
        onClick={pick}
        role="img"
        aria-label="Gráfico da avaliação ao longo da partida. Clique para ir ao lance."
      >
        <polygon points={area} fill="var(--color-eval-light)" opacity={0.9} />
        <line
          x1={0}
          x2={WIDTH}
          y1={HEIGHT / 2}
          y2={HEIGHT / 2}
          stroke="var(--border-strong)"
          strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke"
        />
        {marks.map((index) => (
          <circle
            key={index}
            cx={points[index]?.x ?? 0}
            cy={points[index]?.y ?? 0}
            r={5}
            fill="var(--danger)"
          />
        ))}
        <line
          x1={current * step}
          x2={current * step}
          y1={0}
          y2={HEIGHT}
          stroke="var(--accent)"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <p className="text-xs text-muted">
        Parte clara: chance das brancas. Pontos vermelhos: momentos críticos.
      </p>
    </div>
  );
}
