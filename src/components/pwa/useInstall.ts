"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  canInstall,
  detectPlatform,
  STORAGE_DISMISSED,
  STORAGE_INSTALLED,
  shouldOffer,
  type InstallPlatform,
} from "@/lib/pwa/install";

// Evento do Chrome/Edge/Samsung Internet com a instalação pronta.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// O navegador avisa uma vez só, logo no começo: guardamos o evento aqui, fora
// do React, para o pop-up usar quando aparecer.
let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Sem armazenamento: o convite pode voltar a aparecer, sem problema.
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault(); // nada de faixa automática do navegador
    deferred = event as InstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    writeStorage(STORAGE_INSTALLED, "1");
    notify();
  });
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

type Snapshot = {
  platform: InstallPlatform;
  standalone: boolean;
  installed: boolean;
  hasPrompt: boolean;
  dismissedAt: number | null;
};

let cached: Snapshot | null = null;
let cacheKey = "";

function snapshot(): Snapshot {
  const dismissed = Number(readStorage(STORAGE_DISMISSED));
  const next: Snapshot = {
    platform: detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    standalone: isStandalone(),
    installed: installed || readStorage(STORAGE_INSTALLED) === "1",
    hasPrompt: deferred !== null,
    dismissedAt: Number.isFinite(dismissed) && dismissed > 0 ? dismissed : null,
  };
  const key = JSON.stringify(next);
  if (key !== cacheKey) {
    cacheKey = key;
    cached = next;
  }
  return cached!;
}

const SERVER: Snapshot = {
  platform: "outro",
  standalone: false,
  installed: false,
  hasPrompt: false,
  dismissedAt: null,
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useInstall() {
  const state = useSyncExternalStore(subscribe, snapshot, () => SERVER);

  // Android: abre a janela do navegador. Devolve o que a pessoa escolheu.
  const promptInstall = useCallback(async (): Promise<
    "accepted" | "dismissed" | "indisponivel"
  > => {
    const event = deferred;
    if (!event) return "indisponivel";
    await event.prompt();
    const { outcome } = await event.userChoice;
    deferred = null; // o evento só pode ser usado uma vez
    if (outcome === "accepted") {
      installed = true;
      writeStorage(STORAGE_INSTALLED, "1");
    }
    notify();
    return outcome;
  }, []);

  const dismiss = useCallback(() => {
    writeStorage(STORAGE_DISMISSED, String(Date.now()));
    notify();
  }, []);

  return {
    ...state,
    shouldOffer: (now: number) => shouldOffer({ ...state, now }),
    canInstall: canInstall(state),
    promptInstall,
    dismiss,
  };
}
