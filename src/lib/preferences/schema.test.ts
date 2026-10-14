import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  isEmptyPreferences,
  MAX_PREFERENCES_BYTES,
  parsePreferences,
  preferencesSize,
} from "./schema";

describe("parsePreferences", () => {
  it("vazio vira o padrão", () => {
    expect(parsePreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences("lixo")).toEqual(DEFAULT_PREFERENCES);
    expect(parsePreferences([1, 2])).toEqual(DEFAULT_PREFERENCES);
  });

  it("mantém valores válidos e completa o resto", () => {
    const prefs = parsePreferences({
      board: { theme: "madeira" },
      sound: { volume: 80 },
    });
    expect(prefs.board.theme).toBe("madeira");
    expect(prefs.board.coordinates).toBe("dentro");
    expect(prefs.sound).toEqual({ enabled: true, volume: 80, pack: "suave" });
  });

  it("valor fora da lista volta ao padrão, sem afetar os outros", () => {
    const prefs = parsePreferences({
      board: { theme: "rosa-choque", lastMove: false },
      pieces: "maestro",
      sound: { volume: 500, pack: "suave" },
    });
    expect(prefs.board.theme).toBe("finale");
    expect(prefs.board.lastMove).toBe(false);
    expect(prefs.pieces).toBe("cburnett");
    expect(prefs.sound.volume).toBe(50);
  });

  it("descarta chaves desconhecidas", () => {
    const prefs = parsePreferences({
      hack: "<script>",
      board: { theme: "azul", extra: 1 },
    }) as unknown as Record<string, unknown>;
    expect(prefs.hack).toBeUndefined();
    expect((prefs.board as Record<string, unknown>).extra).toBeUndefined();
  });

  it("cabe no limite de 2 KB", () => {
    expect(preferencesSize(DEFAULT_PREFERENCES)).toBeLessThan(
      MAX_PREFERENCES_BYTES,
    );
  });
});

describe("isEmptyPreferences", () => {
  it("só {} ou nada contam como vazio", () => {
    expect(isEmptyPreferences({})).toBe(true);
    expect(isEmptyPreferences(null)).toBe(true);
    expect(isEmptyPreferences({ pieces: "chessnut" })).toBe(false);
  });
});
