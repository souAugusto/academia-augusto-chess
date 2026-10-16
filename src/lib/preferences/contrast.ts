// Contraste (fórmula WCAG) entre cores sólidas em hexadecimal.
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Separação de uma peça na casa: a melhor entre corpo, contorno e o contorno
// extra do tema (halo), que é o que de fato desenha a borda da peça.
export function pieceSeparation(
  square: string,
  piece: { body: string; outline: string },
  halo?: string,
): number {
  return Math.max(
    contrast(piece.body, square),
    contrast(piece.outline, square),
    halo ? contrast(halo, square) : 0,
  );
}
