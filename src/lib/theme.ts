// Tema claro/escuro. Escuro é o padrão; a escolha fica no localStorage.
// "sistema" segue a configuração do aparelho.
export type Theme = "dark" | "light";
export type ThemeChoice = Theme | "system";
export const THEME_STORAGE_KEY = "finale-tema";

// Roda no <head> antes da pintura, para não piscar o tema errado.
// Mantido minúsculo e sem dependências: é inserido inline no HTML.
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||(t==="system"&&matchMedia("(prefers-color-scheme: light)").matches)){document.documentElement.dataset.theme="light"}}catch(e){}})();`;

export function readThemeChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "system" ? value : "dark";
  } catch {
    return "dark";
  }
}

// Aplica a escolha agora (sem recarregar) e guarda no navegador.
export function applyThemeChoice(choice: ThemeChoice) {
  const light =
    choice === "light" ||
    (choice === "system" &&
      window.matchMedia("(prefers-color-scheme: light)").matches);
  const root = document.documentElement;
  if (light) root.dataset.theme = "light";
  else delete root.dataset.theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Navegação privada: vale só para esta visita.
  }
}
