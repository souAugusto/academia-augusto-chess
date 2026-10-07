// Tema claro/escuro. Escuro é o padrão; a escolha fica no localStorage.
export type Theme = "dark" | "light";
export const THEME_STORAGE_KEY = "finale-tema";

// Roda no <head> antes da pintura, para não piscar o tema errado.
// Mantido minúsculo e sem dependências: é inserido inline no HTML.
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"){document.documentElement.dataset.theme="light"}}catch(e){}})();`;
