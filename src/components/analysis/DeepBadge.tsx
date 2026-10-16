"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { deepAnalysisText } from "@/lib/analysis/profile";

// Selo fixo "Análise profunda". Ao tocar ou passar o mouse, explica o padrão
// (os números vêm de ANALYSIS_PROFILE).
export function DeepBadge() {
  const [open, setOpen] = useState(false);
  const id = useId();
  const root = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (
        event instanceof PointerEvent &&
        root.current?.contains(event.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <span
      ref={root}
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        // Clique sempre abre (no celular não há "passar o mouse"); fecha com Esc,
        // clique fora ou tirando o mouse.
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-accent/60 bg-accent/10 px-3 text-xs font-semibold text-accent-text"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
        </svg>
        Análise profunda
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute top-full left-0 z-30 mt-2 flex w-72 flex-col gap-2 rounded-card border border-border bg-surface p-4 text-left text-sm leading-relaxed text-text shadow-card"
        >
          {deepAnalysisText()}
          <Link
            href="/como-analisamos"
            className="font-semibold text-accent-text underline-offset-4 hover:underline"
          >
            Como analisamos
          </Link>
        </span>
      )}
    </span>
  );
}
