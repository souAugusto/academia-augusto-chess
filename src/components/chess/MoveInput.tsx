"use client";

import type { Square } from "chess.js";
import { useId, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { parseTypedMove } from "@/lib/chess/notation";

type MoveInputProps = {
  fen: string;
  disabled: boolean;
  onMove: (from: Square, to: Square, promotion?: string) => void;
  onInvalid: (message: string) => void;
};

// Caixa para digitar o lance (teclado e leitores de tela): "Dxf7", "Cf3", "h5f7".
export function MoveInput({
  fen,
  disabled,
  onMove,
  onInvalid,
}: MoveInputProps) {
  const [typed, setTyped] = useState("");
  const inputId = useId();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = typed.trim();
    if (!value) return;
    const move = parseTypedMove(fen, value);
    if (!move) {
      onInvalid(`"${value}" não é um lance válido nesta posição.`);
      return;
    }
    setTyped("");
    onMove(move.from as Square, move.to as Square, move.promotion);
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <label htmlFor={inputId} className="sr-only">
        Digite o lance (ex.: Dxf7 ou h5f7)
      </label>
      <input
        id={inputId}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        disabled={disabled}
        placeholder="Ou digite o lance (ex.: Dxf7)"
        autoComplete="off"
        className="min-h-touch min-w-0 flex-1 rounded-control border border-border-strong bg-surface px-3 text-base text-text placeholder:text-muted disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled}
        className={buttonClasses("secondary")}
      >
        Jogar
      </button>
    </form>
  );
}
