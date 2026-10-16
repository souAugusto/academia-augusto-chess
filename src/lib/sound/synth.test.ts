import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES, parsePreferences, SOUND_PACKS } from "@/lib/preferences/schema";
import { shouldPlay } from "./index";
import {
  SOUND_EVENTS,
  SOUND_GROUP_OF,
  soundForMove,
  synthesize,
  VIBRATION_PATTERNS,
} from "./synth";

const RATE = 22050;
const peak = (s: Float32Array) => s.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
// Energia nos primeiros 120 ms (o "corpo" do som).
const body = (s: Float32Array) => {
  const n = Math.min(s.length, Math.floor(0.12 * RATE));
  let sum = 0;
  for (let i = 0; i < n; i++) sum += s[i] * s[i];
  return Math.sqrt(sum / n);
};

describe("synthesize", () => {
  it("gera todos os sons de todos os pacotes, curtos e sem estourar", () => {
    for (const pack of SOUND_PACKS)
      for (const event of SOUND_EVENTS) {
        const samples = synthesize(event, pack, RATE);
        expect(samples.length, `${pack}/${event}`).toBeGreaterThan(200);
        expect(samples.length / RATE).toBeLessThan(1.6);
        expect(peak(samples), `${pack}/${event}`).toBeGreaterThan(0.05);
        expect(peak(samples)).toBeLessThanOrEqual(0.9001);
      }
  });

  it("cada pacote soa diferente", () => {
    const audio = SOUND_PACKS.filter((p) => p !== "vibracao");
    for (const event of ["move", "capture", "check", "wrong"] as const) {
      const signatures = audio.map((pack) =>
        Array.from(synthesize(event, pack, 8000).slice(0, 400))
          .map((v) => v.toFixed(3))
          .join(","),
      );
      expect(new Set(signatures).size, event).toBe(audio.length);
    }
  });

  it("Oco e Madeira têm mais corpo que o Suave no lance e na captura", () => {
    for (const event of ["move", "capture"] as const) {
      const suave = body(synthesize(event, "suave", RATE));
      expect(body(synthesize(event, "oco", RATE))).toBeGreaterThan(suave);
      expect(body(synthesize(event, "madeira", RATE))).toBeGreaterThan(suave);
    }
  });

  it("é determinístico", () => {
    expect(synthesize("capture", "oco", 8000)).toEqual(
      synthesize("capture", "oco", 8000),
    );
  });

  it("vibração tem padrão para todos os eventos", () => {
    for (const event of SOUND_EVENTS)
      expect(VIBRATION_PATTERNS[event].length).toBeGreaterThan(0);
  });
});

describe("shouldPlay", () => {
  const base = DEFAULT_PREFERENCES.sound;
  it("respeita som desligado, volume zero e grupos", () => {
    expect(shouldPlay("move", base)).toBe(true);
    expect(shouldPlay("move", { ...base, enabled: false })).toBe(false);
    expect(shouldPlay("move", { ...base, volume: 0 })).toBe(false);
    expect(shouldPlay("ui", base)).toBe(false); // interface começa desligada
    expect(
      shouldPlay("correct", { ...base, groups: { ...base.groups, feedback: false } }),
    ).toBe(false);
    expect(SOUND_GROUP_OF.title).toBe("feedback");
  });

  it("respeita a opção do lance do adversário", () => {
    expect(shouldPlay("move", base, { opponent: true })).toBe(true);
    expect(shouldPlay("move", { ...base, opponent: false }, { opponent: true })).toBe(false);
    expect(shouldPlay("move", { ...base, opponent: false })).toBe(true);
  });

  it("vibração não depende do volume", () => {
    expect(shouldPlay("move", { ...base, pack: "vibracao", volume: 0 })).toBe(true);
  });
});

describe("preferências de som", () => {
  it("o padrão é o Suave (o Engraçado nunca vem ligado)", () => {
    expect(DEFAULT_PREFERENCES.sound.pack).toBe("suave");
  });

  it("formato antigo ganha grupos e opção do adversário sem perder a escolha", () => {
    const old = { v: 1, sound: { enabled: false, volume: 30, pack: "madeira" } };
    const prefs = parsePreferences(old);
    expect(prefs.sound).toEqual({
      enabled: false,
      volume: 30,
      pack: "madeira",
      groups: { lances: true, feedback: true, interface: false },
      opponent: true,
    });
    expect(parsePreferences({ sound: { pack: "inexistente" } }).sound.pack).toBe("suave");
  });
});

describe("soundForMove", () => {
  const play = (fen: string, san: string) =>
    soundForMove(new Chess(fen).move(san));

  it("classifica os lances", () => {
    const start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(play(start, "e4")).toBe("move");
    expect(play("4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1", "exd5")).toBe("capture");
    expect(play("4k3/8/8/8/8/8/8/R3K3 w Q - 0 1", "O-O-O")).toBe("castle");
    expect(play("8/P6k/8/8/8/8/8/4K3 w - - 0 1", "a8=N")).toBe("promote");
    expect(play("4k3/8/8/8/8/8/8/R3K3 w - - 0 1", "Ra8+")).toBe("check");
    expect(play("6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1", "Ra8#")).toBe("mate");
  });
});
