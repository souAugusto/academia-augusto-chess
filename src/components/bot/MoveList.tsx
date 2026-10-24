import type { ReactNode } from "react";
import type { MoveMark } from "@/lib/bot/review";

const MARK_SYMBOL: Record<Exclude<MoveMark, null>, string> = {
  "erro-grave": "??",
  erro: "?",
  imprecisao: "?!",
};
const MARK_CLASS: Record<Exclude<MoveMark, null>, string> = {
  "erro-grave": "text-cls-erro-grave",
  erro: "text-cls-erro",
  imprecisao: "text-cls-imprecisao",
};

// Lista de lances em duas colunas, com as marcas de erro dos lances do aluno.
// Com onSelect, cada lance vira botão (revisão); `current` é o meio-lance
// mostrado (1 = depois do primeiro lance).
export function MoveList({
  sans,
  marks,
  current,
  onSelect,
}: {
  sans: string[];
  marks: Map<number, MoveMark>;
  current?: number;
  onSelect?: (ply: number) => void;
}) {
  return (
    <ol className="grid max-h-48 grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-1 overflow-y-auto text-[0.9375rem] tabular-nums lg:max-h-none">
      {Array.from({ length: Math.ceil(sans.length / 2) }, (_, row) => (
        <li key={row} className="contents">
          <span className="text-muted">{row + 1}.</span>
          {[0, 1].map((col) => {
            const ply = row * 2 + col;
            const san = sans[ply];
            if (!san) return <span key={col} />;
            const mark = marks.get(ply) ?? null;
            const content: ReactNode = (
              <>
                {san}
                {mark && (
                  <span className={`ml-0.5 font-semibold ${MARK_CLASS[mark]}`}>
                    {MARK_SYMBOL[mark]}
                  </span>
                )}
              </>
            );
            return onSelect ? (
              <button
                key={col}
                type="button"
                onClick={() => onSelect(ply + 1)}
                className={`rounded px-1 text-left ${current === ply + 1 ? "bg-accent text-on-accent" : "hover:bg-surface-2"}`}
              >
                {content}
              </button>
            ) : (
              <span key={col} className="px-1">
                {content}
              </span>
            );
          })}
        </li>
      ))}
    </ol>
  );
}
