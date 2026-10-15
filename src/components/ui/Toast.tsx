"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { IconClose } from "./icons";

type Tone = "sucesso" | "erro";
type Toast = { id: number; tone: Tone; text: string };

const ToastContext = createContext<(tone: Tone, text: string) => void>(
  () => {},
);

// Avisos curtos ("Perfil salvo.", "Não consegui salvar agora.") no pé da
// tela. Somem sozinhos; o leitor de tela anuncia pela região "status"/"alert".
// Não bloqueiam cliques no que está embaixo (só o botão de fechar é clicável).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((tone: Tone, text: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { id, tone, text }]);
  }, []);
  const remove = useCallback(
    (id: number) => setToasts((list) => list.filter((item) => item.id !== id)),
    [],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDone={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDone,
}: {
  toast: Toast;
  onDone: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(
      () => onDone(toast.id),
      toast.tone === "erro" ? 7000 : 4000,
    );
    return () => window.clearTimeout(timer);
  }, [onDone, toast.id, toast.tone]);
  return (
    <div
      role={toast.tone === "erro" ? "alert" : "status"}
      className={`pointer-events-none flex w-full max-w-md items-start justify-between gap-3 rounded-card border px-4 py-3 text-[0.9375rem] shadow-card ${
        toast.tone === "erro"
          ? "border-danger bg-surface text-danger"
          : "border-accent bg-surface-2 text-text"
      }`}
    >
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={() => onDone(toast.id)}
        className="pointer-events-auto shrink-0 rounded-control text-muted hover:text-text"
        aria-label="Fechar aviso"
      >
        <IconClose className="size-4" />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
