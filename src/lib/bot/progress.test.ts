import { describe, expect, it } from "vitest";
import {
  achievements,
  bestResult,
  botStatus,
  mergeProgress,
  newAchievements,
  parseProgress,
  recordGame,
} from "./progress";

const ORDER = ["a", "b", "c"];

describe("trilha", () => {
  it("libera o próximo depois de vencer o anterior", () => {
    expect(botStatus(ORDER, {}, "a")).toBe("disponivel");
    expect(botStatus(ORDER, {}, "b")).toBe("bloqueado");
    const p = recordGame({}, "a", "vitoria", 2);
    expect(botStatus(ORDER, p, "a")).toBe("vencido");
    expect(botStatus(ORDER, p, "b")).toBe("disponivel");
    expect(botStatus(ORDER, p, "c")).toBe("bloqueado");
    expect(botStatus(ORDER, recordGame({}, "a", "empate", 0), "b")).toBe("bloqueado");
    expect(botStatus(ORDER, {}, "x")).toBe("bloqueado");
  });

  it("registra partidas e guarda a melhor nota", () => {
    let p = recordGame({}, "a", "derrota", 0);
    expect(bestResult(p.a)).toBe("derrota");
    p = recordGame(p, "a", "vitoria", 3);
    p = recordGame(p, "a", "vitoria", 1);
    expect(p.a).toEqual({ vitorias: 2, derrotas: 1, empates: 0, estrelas: 3 });
    expect(bestResult(p.a)).toBe("vitoria");
    expect(bestResult(undefined)).toBeNull();
    expect(recordGame({}, "a", "vitoria", 9).a.estrelas).toBe(3);
  });

  it("juntar o aparelho com a conta não duplica", () => {
    const local = recordGame(recordGame({}, "a", "vitoria", 2), "b", "derrota", 0);
    const conta = recordGame({}, "a", "vitoria", 3);
    const once = mergeProgress(conta, local);
    expect(once.a).toEqual({ vitorias: 1, derrotas: 0, empates: 0, estrelas: 3 });
    expect(once.b.derrotas).toBe(1);
    expect(mergeProgress(once, local)).toEqual(once);
  });

  it("descarta dados estranhos", () => {
    const raw = {
      a: { vitorias: 2, derrotas: -1, empates: "x", estrelas: 7 },
      z: { vitorias: 1 },
      b: 3,
    };
    expect(parseProgress(raw, ORDER)).toEqual({
      a: { vitorias: 2, derrotas: 0, empates: 0, estrelas: 3 },
    });
    expect(parseProgress(null, ORDER)).toEqual({});
    expect(parseProgress("x", ORDER)).toEqual({});
  });
});

describe("conquistas", () => {
  it("aparecem conforme o progresso", () => {
    expect(achievements(ORDER, {})).toEqual([]);
    const p1 = recordGame({}, "a", "derrota", 0);
    expect(achievements(ORDER, p1).map((a) => a.id)).toEqual(["primeira-partida"]);
    const p2 = recordGame(p1, "a", "vitoria", 3);
    expect(newAchievements(ORDER, p1, p2).map((a) => a.id)).toEqual([
      "primeira-vitoria",
      "tres-estrelas",
    ]);
    const p3 = recordGame(recordGame(p2, "b", "vitoria", 1), "c", "empate", 0);
    const ids = achievements(ORDER, p3).map((a) => a.id);
    expect(ids).toContain("meio-caminho");
    expect(ids).toContain("diante-do-rei");
    expect(ids).not.toContain("coroa");
  });
});
