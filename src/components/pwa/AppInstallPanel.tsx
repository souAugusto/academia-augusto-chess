"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { APP_PAGE } from "@/content/app-page";
import {
  nextOrigin,
  sanitizeOrigin,
  STORAGE_ORIGIN,
  type StoredOrigin,
} from "@/lib/pwa/origin";
import { InstallSheet, ShareIcon } from "./InstallSheet";
import { useInstall } from "./useInstall";

// Guarda o ?origem= da visita só no aparelho (não há métricas no site).
function rememberOrigin() {
  const origin = sanitizeOrigin(
    new URLSearchParams(window.location.search).get("origem"),
  );
  if (!origin) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_ORIGIN);
    const previous = raw ? (JSON.parse(raw) as StoredOrigin) : null;
    window.localStorage.setItem(
      STORAGE_ORIGIN,
      JSON.stringify(nextOrigin(previous, origin, Date.now())),
    );
  } catch {
    // Sem armazenamento: só não guarda a origem.
  }
}

function scrollToGuide() {
  document.getElementById("como-instalar")?.scrollIntoView({ behavior: "smooth" });
}

// Botão principal da página /app, com o estado de cada aparelho:
// Android/Chrome/Edge (instalação do navegador), iPhone (passo a passo),
// já instalado (abrir a Finale) e computador (QR code para o celular).
export function AppInstallPanel() {
  const install = useInstall();
  const [sheet, setSheet] = useState(false);

  useEffect(rememberOrigin, []);

  if (install.standalone || install.installed) {
    return (
      <div className="flex flex-col items-center gap-3 sm:items-start">
        <p className="flex items-center gap-2 font-semibold text-success">
          <span aria-hidden="true">✓</span>
          {APP_PAGE.installed}
        </p>
        <Link href="/painel" className={buttonClasses("primary", "lg", "px-8")}>
          {APP_PAGE.openSite}
        </Link>
      </div>
    );
  }

  const ios = install.platform === "ios-safari" || install.platform === "ios-outro";
  const desktop = install.platform === "desktop";

  async function onInstall() {
    if (ios) return setSheet(true);
    if (install.hasPrompt) {
      await install.promptInstall();
      return;
    }
    // Navegador sem a instalação automática: mostra o passo a passo.
    scrollToGuide();
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:items-start">
      <div className="flex flex-wrap justify-center gap-3">
        {(!desktop || install.hasPrompt) && (
          <button
            type="button"
            onClick={onInstall}
            className={buttonClasses("primary", "lg", "px-8")}
          >
            {desktop ? "Instalar no computador" : "Instalar agora"}
          </button>
        )}
        <a href="#como-instalar" className={buttonClasses("secondary", "lg")}>
          Como instalar
        </a>
      </div>

      {desktop && (
        <div className="flex items-center gap-5 rounded-card border border-border bg-surface p-4 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático */}
          <img
            src="/brand/qr-app.svg"
            alt="QR code para abrir academiafinale.site/app no celular"
            width={128}
            height={128}
            className="size-32 shrink-0 rounded-lg bg-white p-1"
          />
          <div className="flex max-w-xs flex-col gap-1">
            <p className="font-semibold">{APP_PAGE.desktopTitle}</p>
            <p className="text-sm leading-relaxed text-muted">
              {APP_PAGE.desktopText}
              {!install.hasPrompt &&
                " No computador, dá para instalar pelo Chrome ou pelo Edge."}
            </p>
          </div>
        </div>
      )}

      {sheet && (
        <InstallSheet
          platform={install.platform}
          initialStep="ios"
          onInstall={() => setSheet(false)}
          onClose={() => setSheet(false)}
        />
      )}
    </div>
  );
}

type Tab = "android" | "iphone";

const STEPS: Record<Tab, React.ReactNode[]> = {
  android: [
    <>
      Abra <strong>academiafinale.site/app</strong> no <strong>Chrome</strong> (ou
      no navegador da Samsung).
    </>,
    <>
      Toque em <strong>Instalar agora</strong>. Se o botão não abrir nada, toque
      no menu <strong>⋮</strong> e escolha <strong>Instalar app</strong> ou{" "}
      <strong>Adicionar à tela inicial</strong>.
    </>,
    <>
      Confirme em <strong>Instalar</strong>. O ícone da Finale aparece junto dos
      seus apps.
    </>,
  ],
  iphone: [
    <>
      Abra <strong>academiafinale.site/app</strong> no <strong>Safari</strong>.
      Em outros navegadores do iPhone a instalação não aparece.
    </>,
    <>
      Toque em <strong>Compartilhar</strong> <ShareIcon /> na barra do Safari
      (embaixo, ou no topo no iPad).
    </>,
    <>
      Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.
    </>,
    <>
      Toque em <strong>Adicionar</strong>. O ícone da Finale aparece na tela
      inicial.
    </>,
  ],
};

// Passo a passo em abas, já aberto na aba do aparelho de quem visita.
export function InstallGuide() {
  const { platform } = useInstall();
  const [chosen, setChosen] = useState<Tab | null>(null);
  const tab: Tab =
    chosen ?? (platform === "ios-safari" || platform === "ios-outro" ? "iphone" : "android");

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Aparelho"
        className="inline-flex self-start rounded-control border border-border bg-surface p-1"
      >
        {(["android", "iphone"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`aba-${id}`}
            aria-selected={tab === id}
            aria-controls={`painel-${id}`}
            onClick={() => setChosen(id)}
            className={`min-h-touch rounded-control px-5 text-[0.9375rem] font-semibold transition ${
              tab === id ? "bg-accent text-on-accent" : "text-muted hover:text-text"
            }`}
          >
            {id === "android" ? "Android" : "iPhone"}
          </button>
        ))}
      </div>
      <ol
        role="tabpanel"
        id={`painel-${tab}`}
        aria-labelledby={`aba-${tab}`}
        className="flex flex-col gap-4 text-base leading-relaxed"
      >
        {STEPS[tab].map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
