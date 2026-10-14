import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { SOUND_EVENTS, soundForMove, synthesize } from "./synth";

describe("synthesize", () => {
  it("gera todos os sons dos dois pacotes, curtos e sem estourar", () => {
    for (const pack of ["suave", "madeira"] as const)
      for (const event of SOUND_EVENTS) {
        const samples = synthesize(event, pack, 22050);
        expect(samples.length).toBeGreaterThan(500);
        expect(samples.length / 22050).toBeLessThan(1.5);
        const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
        expect(peak).toBeGreaterThan(0.05);
        expect(peak).toBeLessThanOrEqual(1);
      }
  });

  it("é determinístico", () => {
    expect(synthesize("capture", "madeira", 8000)).toEqual(
      synthesize("capture", "madeira", 8000),
    );
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
  });
});
