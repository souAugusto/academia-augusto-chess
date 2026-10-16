"use client";

import { useEffect, useRef } from "react";
import { CLASS_LABELS, type ReviewedMove } from "@/lib/analysis/classify";
import { sanToPortuguese } from "@/lib/chess/notation";
import { MoveClassIcon } from "./MoveClassIcon";

// Lista de lances em duas colunas (brancas e pretas) com o ícone da classe.
// O lance atual fica destacado e a lista rola sozinha até ele.
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
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const active = list.current?.querySelector<HTMLElement>("[aria-current]");
    const box = list.current;
    if (!active || !box) return;
    // Rola só a lista (não a página). A lista é "relative": offsetTop já é
    // a distância até o topo dela.
    const top = active.offsetTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 40)
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 2) });
  }, [current]);

  const rows: number[] = [];
  for (let ply = 0; ply < sans.length; ply += 2) rows.push(ply);

  const cell = (ply: number) => {
    const san = sans[ply];
    if (!san) return <span />;
    const review = reviewed[ply];
    const active = current === ply + 1;
    return (
      <button
        type="button"
        onClick={() => onSelect(ply + 1)}
        aria-current={active ? "step" : undefined}
        aria-label={`${sanToPortuguese(san)}${review ? `, ${CLASS_LABELS[review.cls]}` : ""}`}
        className={`flex min-h-9 items-center justify-between gap-1 rounded px-2 text-left font-mono text-sm ${active ? "bg-surface-2 font-semibold text-text ring-1 ring-accent" : "hover:bg-surface-2"}`}
      >
        <span>{sanToPortuguese(san)}</span>
        {review && <MoveClassIcon cls={review.cls} size={16} decorative />}
      </button>
    );
  };

  return (
    <ol
      ref={list}
      aria-label="Lances da partida"
      className="relative grid max-h-72 grid-cols-[2.25rem_1fr_1fr] gap-x-1 gap-y-0.5 overflow-y-auto pr-1 lg:max-h-none lg:flex-1"
    >
      {rows.map((ply) => (
        <li key={ply} className="contents">
          <span className="flex items-center justify-end font-mono text-sm text-muted">
            {ply / 2 + 1}.
          </span>
          {cell(ply)}
          {cell(ply + 1)}
        </li>
      ))}
    </ol>
  );
}
