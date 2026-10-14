"use client";

import { sanToPortuguese } from "@/lib/chess/notation";
import { CLASS_LABELS, type ReviewedMove } from "@/lib/analysis/review";
import { CLASS_STYLE } from "./classStyle";

// Lista de lances com o símbolo da classificação. Clicar leva ao lance.
export function MoveList({
  sans,
  reviewed,
  current,
  onSelect,
}: {
  sans: string[];
  reviewed: ReviewedMove[];
  current: number; // quantas meias-jogadas estão no tabuleiro
  onSelect: (index: number) => void;
}) {
  const rows: number[] = [];
  for (let ply = 0; ply < sans.length; ply += 2) rows.push(ply);

  const cell = (ply: number) => {
    const san = sans[ply];
    if (!san) return <span />;
    const review = reviewed[ply];
    const style = review ? CLASS_STYLE[review.cls] : null;
    const active = current === ply + 1;
    return (
      <button
        type="button"
        onClick={() => onSelect(ply + 1)}
        aria-current={active ? "step" : undefined}
        className={`flex items-center justify-between gap-1 rounded px-2 py-1 text-left font-mono text-sm ${active ? "bg-accent text-on-accent" : "hover:bg-surface-2"}`}
      >
        <span>{sanToPortuguese(san)}</span>
        {review && style && (
          <span
            className={active ? "" : style.text}
            title={CLASS_LABELS[review.cls]}
            aria-label={CLASS_LABELS[review.cls]}
          >
            {style.symbol}
          </span>
        )}
      </button>
    );
  };

  return (
    <ol className="grid max-h-72 grid-cols-[2.5rem_1fr_1fr] gap-x-1 gap-y-0.5 overflow-y-auto pr-1">
      {rows.map((ply) => (
        <li key={ply} className="contents">
          <span className="py-1 text-right font-mono text-sm text-muted">
            {ply / 2 + 1}.
          </span>
          {cell(ply)}
          {cell(ply + 1)}
        </li>
      ))}
    </ol>
  );
}
