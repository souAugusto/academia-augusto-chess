import { describe, expect, it } from "vitest";
import { contrast, pieceSeparation } from "./contrast";
import { BOARD_THEME_OPTIONS, PIECE_SET_OPTIONS } from "./options";
import {
  BOARD_THEMES,
  DEFAULT_PREFERENCES,
  parsePreferences,
  PIECE_SETS,
} from "./schema";

describe("contraste peça × casa", () => {
  it("fórmula confere com valores conhecidos", () => {
    expect(contrast("#ffffff", "#000000")).toBeCloseTo(21, 0);
    expect(contrast("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  // Todas as combinações tema × conjunto × cor da peça × casa.
  const cases = BOARD_THEMES.flatMap((theme) =>
    PIECE_SETS.flatMap((set) =>
      (["w", "b"] as const).flatMap((side) =>
        (["light", "dark"] as const).map((tone) => ({ theme, set, side, tone })),
      ),
    ),
  );

  it.each(cases)(
    "$theme · $set · peça $side · casa $tone",
    ({ theme, set, side, tone }) => {
      const colors = BOARD_THEME_OPTIONS[theme].colors;
      const minimum = theme === "contraste" ? 7 : 3;
      const value = pieceSeparation(
        colors[tone],
        PIECE_SET_OPTIONS[set].colors[side],
        colors.halo?.[side],
      );
      expect(value).toBeGreaterThanOrEqual(minimum);
    },
  );

  it("casas claras e escuras bem diferentes em todos os temas", () => {
    for (const theme of BOARD_THEMES) {
      const { light, dark } = BOARD_THEME_OPTIONS[theme].colors;
      expect(contrast(light, dark), theme).toBeGreaterThanOrEqual(1.8);
    }
  });
});

describe("temas antigos", () => {
  it("são convertidos para os novos, sem perder a escolha", () => {
    expect(parsePreferences({ board: { theme: "verde" } }).board.theme).toBe("esmeralda");
    expect(parsePreferences({ board: { theme: "azul" } }).board.theme).toBe("oceano");
    expect(parsePreferences({ board: { theme: "cinza" } }).board.theme).toBe("concreto");
    expect(parsePreferences({ board: { theme: "roxo" } }).board.theme).toBe("uva");
    expect(parsePreferences({ board: { theme: "madeira" } }).board.theme).toBe("madeira");
    expect(parsePreferences({ board: { theme: "xyz" } }).board.theme).toBe(
      DEFAULT_PREFERENCES.board.theme,
    );
  });

  it("o padrão continua o Finale com as peças clássicas", () => {
    expect(DEFAULT_PREFERENCES.board.theme).toBe("finale");
    expect(DEFAULT_PREFERENCES.pieces).toBe("cburnett");
  });
});
