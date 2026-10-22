import type { CSSProperties } from "react";
import type { BoardColors } from "@/lib/preferences/options";

// Arquivo à parte: o tabuleiro só de exibição (StaticBoard) usa isto sem levar
// junto a biblioteca do tabuleiro jogável.
// Moldura na cor do tema e contorno extra das peças (halo) onde a cor da peça
// some na casa. O halo vai por variável CSS, lida pelas imagens das peças.
export function boardFrameStyle(theme: BoardColors): CSSProperties {
  const halo = (color?: string) =>
    color
      ? `drop-shadow(0 0 0.6px ${color}) drop-shadow(0 0 0.6px ${color}) drop-shadow(0 0 0.6px ${color})`
      : "none";
  return {
    boxShadow: `0 0 0 3px ${theme.frame}, 0 12px 32px -20px var(--shadow-color)`,
    ["--piece-halo-w" as string]: halo(theme.halo?.w),
    ["--piece-halo-b" as string]: halo(theme.halo?.b),
  };
}
