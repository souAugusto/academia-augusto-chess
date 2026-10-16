"use client";

import { useRef, useState } from "react";
import { IconClose, IconGear } from "@/components/ui/icons";
import { playSound } from "@/lib/sound";
import { AppearancePanel } from "./AppearancePanel";

// Engrenagem no cabeçalho do tabuleiro: abre as preferências de aparência
// (janela no desktop, painel que sobe de baixo no celular).
export function BoardSettingsButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  // O painel (com as miniaturas de todos os temas e peças) só é montado ao
  // abrir: a tela de treino baixa só as peças do conjunto escolhido.
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          playSound("ui");
          setOpen(true);
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
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Clique no fundo escuro fecha.
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex flex-col gap-5 p-5 pt-0 sm:p-7 sm:pt-0">
          <div className="sticky top-0 z-20 -mx-5 flex items-center justify-between gap-3 border-b border-border bg-bg px-5 pt-3 pb-3 sm:-mx-7 sm:px-7 sm:pt-5">
            <span
              aria-hidden="true"
              className="absolute top-1.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-border-strong sm:hidden"
            />
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
          {open && <AppearancePanel idPrefix="janela" inDialog />}
        </div>
      </dialog>
    </>
  );
}
