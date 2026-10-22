// Regras do convite para instalar o app (lógica pura, testável).

export type InstallPlatform =
  | "android" // Chrome, Edge, Samsung Internet...: instalação pelo navegador
  | "ios-safari" // iPhone/iPad no Safari: passo a passo manual
  | "ios-outro" // iPhone/iPad em outro navegador: orientar a abrir no Safari
  | "desktop"
  | "outro";

export const DISMISS_DAYS = 7;
export const STORAGE_DISMISSED = "finale:pwa:dispensado";
export const STORAGE_INSTALLED = "finale:pwa:instalado";

export function detectPlatform(
  userAgent: string,
  maxTouchPoints = 0,
): InstallPlatform {
  const ua = userAgent;
  // iPadOS se apresenta como Mac, mas tem tela de toque.
  const ios =
    /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  if (ios) {
    const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|Instagram|FBAN|FBAV/.test(ua);
    return otherBrowser ? "ios-outro" : "ios-safari";
  }
  if (/Android/.test(ua)) return "android";
  if (/Windows|Macintosh|Linux|CrOS/.test(ua)) return "desktop";
  return "outro";
}

export type OfferState = {
  platform: InstallPlatform;
  standalone: boolean; // já aberto como app
  installed: boolean; // já instalou (appinstalled ou escolha "aceitar")
  dismissedAt: number | null; // última vez que tocou em "Agora não"
  hasPrompt: boolean; // o navegador ofereceu a instalação (beforeinstallprompt)
  now: number;
};

// Pode mostrar o convite automático? Só celular, só se ainda não instalou e
// só se o navegador sabe instalar (Android com o evento, ou iOS).
export function shouldOffer(state: OfferState): boolean {
  if (state.standalone || state.installed) return false;
  if (
    state.dismissedAt !== null &&
    state.now - state.dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000
  )
    return false;
  if (state.platform === "android") return state.hasPrompt;
  return state.platform === "ios-safari" || state.platform === "ios-outro";
}

// O botão "Instalar app" (manual) aparece onde dá para instalar, mesmo depois
// de "Agora não".
export function canInstall(state: Omit<OfferState, "dismissedAt" | "now">): boolean {
  if (state.standalone || state.installed) return false;
  if (state.platform === "ios-safari" || state.platform === "ios-outro") return true;
  return state.hasPrompt;
}
