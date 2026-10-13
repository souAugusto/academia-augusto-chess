import type { RatingPoint } from "@/lib/games/stats";
import { TIME_CLASS_LABELS, type TimeClass } from "@/lib/games/normalize";

// Evolução do rating: uma linha por categoria de tempo, em SVG (sem biblioteca).
const COLORS: Record<TimeClass, string> = {
  bullet: "var(--danger)",
  blitz: "var(--accent)",
  rapid: "var(--accent-2)",
  classical: "var(--success)",
  correspondence: "var(--text-muted)",
};

const W = 640;
const H = 220;
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };

function formatDay(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

export function RatingChart({
  series,
}: {
  series: Partial<Record<TimeClass, RatingPoint[]>>;
}) {
  const lines = (Object.entries(series) as [TimeClass, RatingPoint[]][]).filter(
    ([, points]) => points.length > 1,
  );
  if (lines.length === 0)
    return (
      <p className="text-sm text-muted">
        Ainda não há partidas suficientes para mostrar a evolução do rating.
      </p>
    );

  const all = lines.flatMap(([, points]) => points);
  const times = all.map((point) => new Date(point.date).getTime());
  const ratings = all.map((point) => point.rating);
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const minR = Math.floor((Math.min(...ratings) - 20) / 50) * 50;
  const maxR = Math.ceil((Math.max(...ratings) + 20) / 50) * 50;
  const x = (date: string) =>
    PAD.left +
    ((new Date(date).getTime() - minT) / Math.max(1, maxT - minT)) *
      (W - PAD.left - PAD.right);
  const y = (rating: number) =>
    PAD.top +
    (1 - (rating - minR) / Math.max(1, maxR - minR)) *
      (H - PAD.top - PAD.bottom);
  const firstDate = all.reduce((a, b) => (a.date < b.date ? a : b)).date;
  const lastDate = all.reduce((a, b) => (a.date > b.date ? a : b)).date;

  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Evolução do rating por categoria de tempo"
      >
        {[minR, Math.round((minR + maxR) / 2), maxR].map((value) => (
          <g key={value}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(value)}
              y2={y(value)}
              stroke="var(--border)"
            />
            <text
              x={PAD.left - 6}
              y={y(value) + 4}
              textAnchor="end"
              fontSize="11"
              fill="var(--text-muted)"
            >
              {value}
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 6} fontSize="11" fill="var(--text-muted)">
          {formatDay(firstDate)}
        </text>
        <text
          x={W - PAD.right}
          y={H - 6}
          textAnchor="end"
          fontSize="11"
          fill="var(--text-muted)"
        >
          {formatDay(lastDate)}
        </text>
        {lines.map(([timeClass, points]) => (
          <polyline
            key={timeClass}
            fill="none"
            stroke={COLORS[timeClass]}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points
              .map((point) => `${x(point.date)},${y(point.rating)}`)
              .join(" ")}
          />
        ))}
      </svg>
      <figcaption className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {lines.map(([timeClass, points]) => (
          <span key={timeClass} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block h-0.5 w-4 rounded"
              style={{ background: COLORS[timeClass] }}
            />
            {TIME_CLASS_LABELS[timeClass]}: {points.at(-1)!.rating}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
