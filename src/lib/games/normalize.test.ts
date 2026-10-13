import { describe, expect, it } from "vitest";
import {
  chessComOpeningName,
  countPgnMoves,
  normalizeChessCom,
  normalizeLichess,
  splitNdjson,
  type ChessComGame,
  type LichessGame,
} from "./normalize";

// Recortes de partidas reais das APIs públicas.
const chessCom: ChessComGame = {
  url: "https://www.chess.com/game/live/97872578329",
  uuid: "e800f78e-a8d2-11ee-8c7e-6cfe544c0428",
  pgn: '[Event "Live Chess"]\n[ECO "B23"]\n[Result "1-0"]\n\n1. e4 {[%clk 0:02:59.9]} 1... c5 2. Nc3 Nc6 3. f4 g6 4. Bc4 Bg7 5. Nf3 e6 6. O-O 1-0',
  time_control: "180",
  time_class: "blitz",
  end_time: 1704133706,
  rules: "chess",
  eco: "https://www.chess.com/openings/Closed-Sicilian-Defense-Grand-Prix-Attack-3...g6-4.Bc4-Bg7-5.Nf3",
  white: { username: "Hikaru", rating: 3236, result: "win" },
  black: { username: "Gravity_Chess", rating: 2867, result: "resigned" },
};

const lichess: LichessGame = {
  id: "zR8HRccT",
  variant: "standard",
  speed: "bullet",
  createdAt: 1791301345086,
  lastMoveAt: 1791301490450,
  status: "outoftime",
  players: {
    white: {
      user: { name: "DrNykterstein", id: "drnykterstein" },
      rating: 3254,
    },
    black: {
      user: { name: "ChessArtHouse", id: "chessarthouse" },
      rating: 3029,
    },
  },
  winner: "white",
  opening: { eco: "A00", name: "Anderssen's Opening" },
  moves: "a3 g6 h3 Bg7 Nf3",
  clock: { initial: 60, increment: 0 },
};

describe("Chess.com", () => {
  it("normaliza a partida do ponto de vista de quem importou", () => {
    expect(normalizeChessCom(chessCom, "hikaru")).toEqual({
      platform: "chesscom",
      externalId: "e800f78e-a8d2-11ee-8c7e-6cfe544c0428",
      playedAt: "2024-01-01T18:28:26.000Z",
      color: "white",
      result: "win",
      endReason: "resign",
      timeControl: "180",
      timeClass: "blitz",
      userRating: 3236,
      opponentRating: 2867,
      openingName: "Closed Sicilian Defense Grand Prix Attack",
      eco: "B23",
      moves: 6,
    });
  });

  it("do outro lado vira derrota; empate e motivos", () => {
    expect(normalizeChessCom(chessCom, "gravity_chess")).toMatchObject({
      color: "black",
      result: "loss",
      endReason: "resign",
      userRating: 2867,
    });
    const draw = {
      ...chessCom,
      white: { ...chessCom.white, result: "repetition" },
      black: { ...chessCom.black, result: "repetition" },
    };
    expect(normalizeChessCom(draw, "hikaru")).toMatchObject({
      result: "draw",
      endReason: "repetition",
    });
    const mated = {
      ...chessCom,
      white: { ...chessCom.white, result: "checkmated" },
      black: { ...chessCom.black, result: "win" },
    };
    expect(normalizeChessCom(mated, "hikaru")).toMatchObject({
      result: "loss",
      endReason: "mate",
    });
  });

  it("ignora variantes, partidas de outra pessoa e categoria desconhecida", () => {
    expect(
      normalizeChessCom({ ...chessCom, rules: "chess960" }, "hikaru"),
    ).toBe(null);
    expect(normalizeChessCom(chessCom, "outro")).toBe(null);
    expect(normalizeChessCom({ ...chessCom, time_class: "?" }, "hikaru")).toBe(
      null,
    );
    expect(
      normalizeChessCom({ ...chessCom, time_class: "daily" }, "hikaru")
        ?.timeClass,
    ).toBe("correspondence");
  });

  it("nome da abertura e contagem de lances", () => {
    expect(
      chessComOpeningName(
        "https://www.chess.com/openings/Italian-Game-Two-Knights-Defense-4.d3",
      ),
    ).toBe("Italian Game Two Knights Defense");
    expect(chessComOpeningName(undefined)).toBe(null);
    expect(
      countPgnMoves('[Event "x"]\n\n1. d4 d5 2. c4 {ok} 2... e6 3. Nc3'),
    ).toBe(3);
    expect(countPgnMoves("")).toBe(null);
  });
});

describe("Lichess", () => {
  it("normaliza a partida", () => {
    expect(normalizeLichess(lichess, "DrNykterstein")).toEqual({
      platform: "lichess",
      externalId: "zR8HRccT",
      playedAt: new Date(1791301490450).toISOString(),
      color: "white",
      result: "win",
      endReason: "timeout",
      timeControl: "60+0",
      timeClass: "bullet",
      userRating: 3254,
      opponentRating: 3029,
      openingName: "Anderssen's Opening",
      eco: "A00",
      moves: 3,
    });
  });

  it("derrota, empate e partidas que não contam", () => {
    expect(normalizeLichess(lichess, "chessarthouse")?.result).toBe("loss");
    expect(
      normalizeLichess(
        { ...lichess, winner: undefined, status: "draw" },
        "drnykterstein",
      ),
    ).toMatchObject({ result: "draw", endReason: "agreement" });
    expect(
      normalizeLichess({ ...lichess, status: "aborted" }, "drnykterstein"),
    ).toBe(null);
    expect(
      normalizeLichess({ ...lichess, variant: "chess960" }, "drnykterstein"),
    ).toBe(null);
    expect(
      normalizeLichess({ ...lichess, speed: "ultraBullet" }, "drnykterstein")
        ?.timeClass,
    ).toBe("bullet");
  });

  it("separa o ndjson em linhas completas e guarda o resto", () => {
    expect(splitNdjson('{"a":1}\n{"b":2}\n{"c"')).toEqual({
      lines: ['{"a":1}', '{"b":2}'],
      rest: '{"c"',
    });
  });
});
