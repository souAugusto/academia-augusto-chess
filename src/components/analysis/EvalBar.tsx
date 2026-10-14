import {
  formatEval,
  winChance,
  type EngineScore,
} from "@/lib/analysis/winprob";

// Barra de avaliação vertical: a parte clara é a chance das brancas.
export function EvalBar({
  score,
  orientation,
}: {
  score: EngineScore | null;
  orientation: "w" | "b";
}) {
  const white = score ? winChance(score) : 50;
  const label = score ? formatEval(score) : "…";
  const whiteOnBottom = orientation === "w";
  return (
    <div
      className="relative flex w-3 shrink-0 overflow-hidden rounded-full border border-border bg-eval-dark sm:w-4"
      role="img"
      aria-label={`Avaliação ${label}`}
    >
      <div
        className={`absolute inset-x-0 bg-eval-light transition-[height] duration-300 motion-reduce:transition-none ${whiteOnBottom ? "bottom-0" : "top-0"}`}
        style={{ height: `${white}%` }}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
