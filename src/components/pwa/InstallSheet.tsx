"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import type { InstallPlatform } from "@/lib/pwa/install";

const BENEFITS = [
  "Acesso rápido pela tela inicial",
  "Tela cheia, sem a barra do navegador",
  "Abre mais rápido",
];

// Ícone "Compartilhar" do Safari (quadrado com seta para cima).
function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline size-5 align-text-bottom text-accent-2-text"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

// Gaveta que sobe da parte de baixo da tela convidando a instalar o app.
// Acessível: diálogo com título, foco no botão principal, Esc fecha e o Tab
// fica dentro da gaveta enquanto ela está aberta.
export function InstallSheet({
  platform,
  onInstall,
  onClose,
}: {
  platform: InstallPlatform;
  onInstall: () => void; // Android: chama a instalação do navegador
  onClose: () => void; // "Agora não", Esc ou fundo
}) {
  const [step, setStep] = useState<"convite" | "ios">("convite");
  const sheet = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const ios = platform === "ios-safari" || platform === "ios-outro";

  useEffect(() => {
    primary.current?.focus();
  }, [step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !sheet.current) return;
      const focusable = sheet.current.querySelectorAll<HTMLElement>("button, a[href]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="install-backdrop absolute inset-0 bg-bg/60 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instalar-titulo"
        aria-describedby="instalar-texto"
        className="install-sheet relative w-full max-w-md rounded-t-panel border border-b-0 border-border bg-surface px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-card"
      >
        <span
          aria-hidden="true"
          className="mx-auto mb-4 block h-1 w-10 rounded-full bg-border-strong"
        />
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- ícone pequeno e estático */}
          <img
            src="/icons/icon-192.png"
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-2xl"
          />
          <h2 id="instalar-titulo" className="font-display text-xl font-semibold">
            Instale o Academia Finale
          </h2>
        </div>

        {step === "convite" ? (
          <>
            <ul id="instalar-texto" className="mt-4 flex flex-col gap-2">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-[0.9375rem]">
                  <span aria-hidden="true" className="text-success">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-col gap-2">
              <button
                ref={primary}
                type="button"
                onClick={() => (ios ? setStep("ios") : onInstall())}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                Instalar
              </button>
              <button
                type="button"
                onClick={onClose}
                className={buttonClasses("ghost", "md", "w-full")}
              >
                Agora não
              </button>
            </div>
          </>
        ) : platform === "ios-outro" ? (
          <>
            <p id="instalar-texto" className="mt-4 text-[0.9375rem] leading-relaxed">
              No iPhone, a instalação é feita pelo <strong>Safari</strong>. Abra
              academiafinale.site no Safari e toque em Instalar de novo.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                ref={primary}
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText("https://www.academiafinale.site")
                    .catch(() => {});
                  onClose();
                }}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                Copiar o endereço
              </button>
              <button type="button" onClick={onClose} className={buttonClasses("ghost", "md", "w-full")}>
                Fechar
              </button>
            </div>
          </>
        ) : (
          <>
            <ol id="instalar-texto" className="mt-4 flex flex-col gap-3 text-[0.9375rem] leading-relaxed">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold">1</span>
                <span>
                  Toque em <strong>Compartilhar</strong> <ShareIcon /> na barra do Safari
                  (embaixo, ou no topo no iPad).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold">2</span>
                <span>
                  Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold">3</span>
                <span>
                  Toque em <strong>Adicionar</strong>. O ícone da Finale aparece na
                  tela inicial.
                </span>
              </li>
            </ol>
            <div className="mt-5">
              <button
                ref={primary}
                type="button"
                onClick={onClose}
                className={buttonClasses("primary", "lg", "w-full")}
              >
                Entendi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
