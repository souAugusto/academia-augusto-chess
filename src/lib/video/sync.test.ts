import { describe, expect, it } from "vitest";
import { formatMark, parseLessonPgn, parseTime, plyAtTime } from "./sync";

const PGN = `{[%t 0:05] Posição inicial.} 1. e4 {[%t 0:45] Abre o centro.} e5
2. Nf3 {[%t 1:02]} Nc6 3. Bc4 {Italiana.}`;

describe("parseTime", () => {
  it("lê segundos, minutos e horas", () => {
    expect(parseTime("45")).toBe(45);
    expect(parseTime("1:02")).toBe(62);
    expect(parseTime("1:00:05")).toBe(3605);
  });
});

describe("parseLessonPgn", () => {
  it("separa marcação de tempo e comentário de cada lance", () => {
    const lesson = parseLessonPgn(PGN)!;
    expect(lesson.hasMarks).toBe(true);
    expect(lesson.plies).toHaveLength(6);
    expect(lesson.plies[0]).toMatchObject({
      ply: 0,
      seconds: 5,
      comment: "Posição inicial.",
    });
    expect(lesson.plies[1]).toMatchObject({
      san: "e4",
      seconds: 45,
      comment: "Abre o centro.",
      from: "e2",
      to: "e4",
    });
    expect(lesson.plies[3]).toMatchObject({
      san: "Nf3",
      seconds: 62,
      comment: null,
    });
    expect(lesson.plies[5]).toMatchObject({
      san: "Bc4",
      seconds: null,
      comment: "Italiana.",
    });
  });

  it("aceita posição inicial da aula (FEN) e recusa PGN inválido", () => {
    const lesson = parseLessonPgn(
      "1. Qh5 {[%t 0:10]}",
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    );
    expect(lesson?.plies[1].san).toBe("Qh5");
    expect(parseLessonPgn("1. e5 e4")).toBe(null);
  });

  it("PGN sem marcações funciona como partida comum", () => {
    expect(parseLessonPgn("1. d4 d5")!.hasMarks).toBe(false);
  });
});

describe("plyAtTime", () => {
  const { plies } = parseLessonPgn(PGN)!;

  it("mostra o último lance cuja marcação já passou", () => {
    expect(plyAtTime(plies, 0)).toBe(0);
    expect(plyAtTime(plies, 44)).toBe(0);
    expect(plyAtTime(plies, 45)).toBe(1);
    expect(plyAtTime(plies, 70)).toBe(3);
    expect(plyAtTime(plies, 9999)).toBe(3);
  });
});

describe("formatMark", () => {
  it("formata para exibir", () => {
    expect(formatMark(65)).toBe("1:05");
    expect(formatMark(3605)).toBe("1:00:05");
  });
});
