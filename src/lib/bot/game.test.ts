import { describe, expect, it } from "vitest";
import {
  acceptsDraw,
  canOfferDraw,
  cannotMate,
  formatClock,
  positionOutcome,
  starsFor,
  timeoutOutcome,
} from "./game";

const flags = {
  isCheckmate: false,
  isStalemate: false,
  isThreefoldRepetition: false,
  isInsufficientMaterial: false,
  isDraw: false,
  turn: "w" as const,
};

describe("fim de partida", () => {
  it("mate, afogamento e empates", () => {
    expect(positionOutcome(flags, "w")).toBeNull();
    expect(positionOutcome({ ...flags, isCheckmate: true, turn: "b" }, "w")).toEqual({
      result: "vitoria",
      reason: "mate",
    });
    expect(positionOutcome({ ...flags, isCheckmate: true, turn: "w" }, "w")).toEqual({
      result: "derrota",
      reason: "mate",
    });
    expect(positionOutcome({ ...flags, isStalemate: true, isDraw: true }, "w")?.reason).toBe(
      "afogamento",
    );
    expect(
      positionOutcome({ ...flags, isThreefoldRepetition: true, isDraw: true }, "w")?.reason,
    ).toBe("repeticao");
    expect(
      positionOutcome({ ...flags, isInsufficientMaterial: true, isDraw: true }, "w")?.reason,
    ).toBe("material");
    expect(positionOutcome({ ...flags, isDraw: true }, "b")).toEqual({
      result: "empate",
      reason: "50-lances",
    });
  });

  it("tempo: perde quem acabou, a menos que o outro não consiga dar mate", () => {
    const kq = "4k3/8/8/8/8/8/8/3QK3 w - - 0 1";
    expect(timeoutOutcome(kq, "b", "w")).toEqual({ result: "vitoria", reason: "tempo" });
    expect(timeoutOutcome(kq, "w", "w")).toEqual({ result: "empate", reason: "tempo" });
    expect(cannotMate("4k3/8/8/8/8/8/8/3NK3 w - - 0 1", "w")).toBe(true);
    expect(cannotMate("4k3/8/8/8/8/8/P7/4K3 w - - 0 1", "w")).toBe(false);
    expect(cannotMate("4k3/8/8/8/8/8/8/2NNK3 w - - 0 1", "w")).toBe(false);
  });
});

describe("empate oferecido", () => {
  it("aceita se está pior, ou se está igual depois de muitos lances", () => {
    expect(acceptsDraw(-200, 10)).toBe(true);
    expect(acceptsDraw(10, 10)).toBe(false);
    expect(acceptsDraw(10, 60)).toBe(true);
    expect(acceptsDraw(150, 80)).toBe(false);
    expect(acceptsDraw(null, 80)).toBe(false);
  });

  it("uma oferta a cada 10 meios-lances", () => {
    expect(canOfferDraw(0, null)).toBe(false);
    expect(canOfferDraw(4, null)).toBe(true);
    expect(canOfferDraw(8, 4)).toBe(false);
    expect(canOfferDraw(14, 4)).toBe(true);
  });
});

describe("estrelas e relógio", () => {
  it("estrelas", () => {
    expect(starsFor("vitoria", false, false)).toBe(3);
    expect(starsFor("vitoria", true, false)).toBe(2);
    expect(starsFor("vitoria", true, true)).toBe(1);
    expect(starsFor("empate", false, false)).toBe(0);
  });

  it("formata o relógio", () => {
    expect(formatClock(600_000)).toBe("10:00");
    expect(formatClock(61_000)).toBe("1:01");
    expect(formatClock(-5)).toBe("0:00");
    expect(formatClock(400)).toBe("0:01");
  });
});
