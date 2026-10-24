import { Chess } from "chess.js";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BOTS } from "@/content/personagens";
import { EXPRESSIONS, REACTIONS } from "./types";

describe("configuração dos personagens", () => {
  it("são 10 níveis em ordem, com ids únicos e um chefe no fim", () => {
    expect(BOTS).toHaveLength(10);
    expect(BOTS.map((b) => b.nivel)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(new Set(BOTS.map((b) => b.id)).size).toBe(10);
    for (const bot of BOTS) expect(bot.id).toMatch(/^[a-z0-9-]+$/);
    expect(BOTS.at(-1)?.chefe).toBe(true);
    expect(BOTS.filter((b) => b.chefe)).toHaveLength(1);
  });

  it("a força sobe de 400 até mais de 2200", () => {
    const elos = BOTS.map((b) => b.eloAprox);
    expect(elos[0]).toBeLessThanOrEqual(400);
    expect(elos.at(-1)).toBeGreaterThan(2200);
    for (let i = 1; i < elos.length; i += 1) expect(elos[i]).toBeGreaterThan(elos[i - 1]);
  });

  it("os erros humanos diminuem a cada nível", () => {
    const multipv = BOTS.flatMap((b) => (b.motor.mode === "multipv" ? [b.motor] : []));
    expect(multipv.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < multipv.length; i += 1) {
      expect(multipv[i].mistakeChance).toBeLessThan(multipv[i - 1].mistakeChance);
      expect(multipv[i].randomChance).toBeLessThanOrEqual(multipv[i - 1].randomChance);
      expect(multipv[i].maxLossCp).toBeLessThan(multipv[i - 1].maxLossCp);
      expect(multipv[i].depth).toBeGreaterThanOrEqual(multipv[i - 1].depth);
    }
    for (const m of multipv) {
      expect(m.multipv).toBeGreaterThanOrEqual(2);
      expect(m.multipv).toBeLessThanOrEqual(5);
      expect(m.mistakeWeights.length).toBeLessThan(m.multipv);
      for (let i = 1; i < m.mistakeWeights.length; i += 1)
        expect(m.mistakeWeights[i]).toBeLessThanOrEqual(m.mistakeWeights[i - 1]);
    }
    const elo = BOTS.flatMap((b) => (b.motor.mode === "elo" ? [b.motor.elo] : []));
    // O Stockfish 19 aceita UCI_Elo de 1320 a 3190.
    for (const e of elo) expect(e).toBeGreaterThanOrEqual(1320);
  });

  it("tem todas as falas e todos os desenhos", () => {
    for (const bot of BOTS) {
      for (const reaction of REACTIONS) {
        expect(bot.frases[reaction].length, `${bot.id}.${reaction}`).toBeGreaterThan(0);
        for (const text of bot.frases[reaction]) expect(text).not.toMatch(/\[|\]/);
      }
      for (const expression of EXPRESSIONS)
        expect(
          existsSync(join(process.cwd(), "public/personagens", bot.id, `${expression}.svg`)),
          `${bot.id}/${expression}.svg`,
        ).toBe(true);
    }
  });

  it("as aberturas são lances legais", () => {
    for (const bot of BOTS)
      for (const line of bot.aberturas ?? []) {
        const chess = new Chess();
        for (const san of line)
          expect(() => chess.move(san), `${bot.id}: ${line.join(" ")}`).not.toThrow();
      }
  });

  it("as ajudas diminuem com o nível", () => {
    for (let i = 1; i < BOTS.length; i += 1) {
      expect(BOTS[i].ajudas.desfazer).toBeLessThanOrEqual(BOTS[i - 1].ajudas.desfazer);
      expect(BOTS[i].ajudas.dicas).toBeLessThanOrEqual(BOTS[i - 1].ajudas.dicas);
    }
  });
});
