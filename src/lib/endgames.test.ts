import { describe, expect, it } from "vitest";
import { classifyMove, endgameStatus } from "./endgames";

describe("classifyMove", () => {
  it("classifica pela perda de avaliação", () => {
    expect(classifyMove(20, 0)).toBe("bom");
    expect(classifyMove(20, -50)).toBe("imprecisao");
    expect(classifyMove(100, -80)).toBe("erro");
    expect(classifyMove(0, -400)).toBe("grave");
  });

  it("não pune quem continua com a vitória garantida", () => {
    expect(classifyMove(9_995, 9_990)).toBe("bom");
    expect(classifyMove(9_995, 900)).toBe("imprecisao");
  });

  it("perder a vitória é erro grave", () => {
    expect(classifyMove(9_995, 0)).toBe("grave");
  });
});

describe("endgameStatus", () => {
  const playing = { isCheckmate: false, isDraw: false, turn: "b" as const };

  it("vitória: mate no adversário é sucesso", () => {
    expect(
      endgameStatus(
        { ...playing, isCheckmate: true, turn: "b" },
        "w",
        "win",
        10,
        50,
      ).kind,
    ).toBe("success");
  });

  it("levar mate é sempre falha", () => {
    expect(
      endgameStatus(
        { ...playing, isCheckmate: true, turn: "w" },
        "w",
        "draw",
        10,
        50,
      ).kind,
    ).toBe("fail");
  });

  it("empate conta como sucesso só quando o objetivo é empatar", () => {
    expect(
      endgameStatus({ ...playing, isDraw: true }, "b", "draw", 3, 50).kind,
    ).toBe("success");
    expect(
      endgameStatus({ ...playing, isDraw: true }, "w", "win", 3, 50).kind,
    ).toBe("fail");
  });

  it("limite de lances: segurar é sucesso, não converter é falha", () => {
    expect(endgameStatus(playing, "b", "draw", 30, 30).kind).toBe("success");
    expect(endgameStatus(playing, "w", "win", 50, 50).kind).toBe("fail");
  });

  it("antes disso, o jogo continua", () => {
    expect(endgameStatus(playing, "w", "win", 12, 50)).toEqual({
      kind: "playing",
    });
  });
});
