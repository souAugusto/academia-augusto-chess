import {
  formatEval,
  winChance,
  type EngineScore,
} from "@/lib/analysis/winprob";

// Barra de avaliação vertical, encostada no tabuleiro: a parte clara é a chance
// das brancas. O número (+1,4, M3) fica na ponta do lado que está melhor.
// No celular a barra é fina e o número aparece no painel.
export function EvalBar({
  score,
  orientation,
}: {
  score: EngineScore | null;
  orientation: "w" | "b";
}) {
  const white = score ? winChance(score) : 50;
  const label = score ? formatEval(score).replace(/^\+/, "") : "…";
  const whiteOnBottom = orientation === "w";
  const whiteAhead = white >= 50;
  // O número fica na ponta de quem está melhor (embaixo se for o lado de baixo).
  const labelAtBottom = whiteAhead === whiteOnBottom;
  return (
    <div
      className="relative flex w-2.5 shrink-0 overflow-hidden rounded-sm bg-eval-dark sm:w-7"
      role="img"
      aria-label={`Avaliação ${score ? formatEval(score) : "em cálculo"}`}
    >
      <div
        className={`absolute inset-x-0 bg-eval-light transition-[height] duration-300 motion-reduce:transition-none ${whiteOnBottom ? "bottom-0" : "top-0"}`}
        style={{ height: `${white}%` }}
      />
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 hidden text-center text-[10px] leading-none font-bold sm:block ${labelAtBottom ? "bottom-1.5" : "top-1.5"} ${whiteAhead ? "text-eval-dark" : "text-eval-light"}`}
      >
        {label}
      </span>
    </div>
  );
}
