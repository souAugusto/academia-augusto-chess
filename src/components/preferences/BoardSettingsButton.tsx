"use client";

import { useRef } from "react";
import { IconClose, IconGear } from "@/components/ui/icons";
import { playSound } from "@/lib/sound";
import { AppearancePanel } from "./AppearancePanel";

// Engrenagem no cabeçalho do tabuleiro: abre as preferências de aparência
// (janela no desktop, painel que sobe de baixo no celular).
export function BoardSettingsButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          playSound("ui");
          dialog.current?.showModal();
        }}
        className="flex size-10 shrink-0 items-center justify-center rounded-control text-muted transition hover:bg-surface-2 hover:text-text"
        aria-label="Aparência do tabuleiro, peças e sons"
        title="Aparência do tabuleiro, peças e sons"
      >
        <IconGear />
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="aparencia-titulo"
        className="settings-sheet"
        onClick={(event) => {
          // Clique no fundo escuro fecha.
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="aparencia-titulo"
              className="font-display text-2xl font-semibold"
            >
              Aparência
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="flex size-10 items-center justify-center rounded-control text-muted hover:bg-surface-2 hover:text-text"
              aria-label="Fechar"
            >
              <IconClose />
            </button>
          </div>
          <AppearancePanel idPrefix="janela" inDialog />
        </div>
      </dialog>
    </>
  );
}
