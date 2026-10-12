import { describe, expect, it } from "vitest";
import {
  endgameSchema,
  grantSchema,
  lessonSchema,
  liveSchema,
  planSchema,
} from "./admin";

const lesson = {
  title: "Mate do corredor",
  description: "",
  video: "",
  fen: "",
  pgn: "",
  category: "regular",
  position: "0",
};

describe("lessonSchema", () => {
  it("aceita link do YouTube e guarda só o código", () => {
    const parsed = lessonSchema.parse({
      ...lesson,
      video: "https://youtu.be/dQw4w9WgXcQ",
      isPublished: "on",
    });
    expect(parsed.video).toBe("dQw4w9WgXcQ");
    expect(parsed.isPublished).toBe(true);
    expect(parsed.description).toBe(null);
  });

  it("vídeo vazio é permitido; link estranho não", () => {
    expect(lessonSchema.parse(lesson).video).toBe(null);
    expect(
      lessonSchema.safeParse({ ...lesson, video: "https://vimeo.com/123" })
        .success,
    ).toBe(false);
  });

  it("FEN, quando informada, precisa ser válida", () => {
    expect(lessonSchema.safeParse({ ...lesson, fen: "xyz" }).success).toBe(
      false,
    );
  });
});

describe("endgameSchema", () => {
  const endgame = {
    slug: "Lucena",
    title: "Posição de Lucena",
    description: "",
    category: "Torre",
    level: "3",
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    userColor: "white",
    goal: "win",
    maxMoves: "40",
    planRequired: "1",
    position: "0",
  };

  it("valida slug, FEN e números", () => {
    const parsed = endgameSchema.parse(endgame);
    expect(parsed.slug).toBe("lucena");
    expect(parsed.level).toBe(3);
    expect(parsed.isPublished).toBe(false);
  });

  it("recusa FEN inválida e slug com espaço", () => {
    const result = endgameSchema.safeParse({
      ...endgame,
      slug: "posição lucena",
      fen: "8/8/8 w",
    });
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      "slug",
      "fen",
    ]);
  });
});

describe("planSchema", () => {
  it("converte reais em centavos e vaga vazia em sem limite", () => {
    expect(
      planSchema.parse({ id: "membro", priceReais: "19.90", seatLimit: "" }),
    ).toEqual({ id: "membro", priceReais: 1990, seatLimit: null });
    expect(
      planSchema.safeParse({
        id: "intensivo",
        priceReais: "119",
        seatLimit: "0",
      }).success,
    ).toBe(false);
  });
});

describe("grantSchema e liveSchema", () => {
  it("datas no horário de Brasília", () => {
    expect(
      grantSchema.parse({
        userId: "6f1c2a4e-1b2c-4d5e-8f90-123456789abc",
        planId: "intensivo",
        until: "2027-03-15",
      }).until,
    ).toBe("2027-03-16T02:59:59.000Z");
    expect(
      liveSchema.parse({
        title: "Live de finais",
        startsAt: "2027-03-15T20:00",
        url: "",
        audience: "public",
      }).startsAt,
    ).toBe("2027-03-15T23:00:00.000Z");
  });
});

describe("conjuntos e trilhas", () => {
  it("lê códigos de puzzle em qualquer formato, sem repetir", async () => {
    const { parsePuzzleIds } = await import("./admin");
    expect(
      parsePuzzleIds(
        "00sHx, 00sJ9\nhttps://lichess.org/training/00sO1 00sHx xx",
      ),
    ).toEqual(["00sHx", "00sJ9", "00sO1"]);
  });

  it("etapa de trilha vem como tipo:id", async () => {
    const { stepSchema } = await import("./admin");
    const parsed = stepSchema.parse({
      trailId: "6f1c2a4e-1b2c-4d5e-8f90-123456789abc",
      ref: "endgame:6f1c2a4e-1b2c-4d5e-8f90-123456789abd",
      position: "2",
    });
    expect(parsed.ref).toEqual({
      kind: "endgame",
      id: "6f1c2a4e-1b2c-4d5e-8f90-123456789abd",
    });
    expect(parsed.title).toBe("");
    expect(
      stepSchema.safeParse({
        trailId: parsed.trailId,
        ref: "aula:1",
        position: "0",
      }).success,
    ).toBe(false);
  });
});
