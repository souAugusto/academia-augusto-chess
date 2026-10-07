"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import { IconMoon, IconSun } from "./icons";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  // No servidor o tema é desconhecido; assume o padrão (escuro).
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "dark" as Theme,
  );
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    const root = document.documentElement;
    if (next === "light") root.dataset.theme = "light";
    else delete root.dataset.theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Navegação privada: o tema vale só para esta visita.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex size-touch items-center justify-center rounded-control text-muted transition hover:bg-surface-2 hover:text-text ${className}`}
    >
      <span className="sr-only">
        {next === "light" ? "Usar tema claro" : "Usar tema escuro"}
      </span>
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
