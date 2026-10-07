import { describe, expect, it } from "vitest";
import {
  BucketSampler,
  BUCKET_COUNT,
  parseLichessLine,
  passesQuality,
  ratingBucket,
  toPuzzleRow,
} from "./lichess";

const line =
  "00sHx,q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17,e8d7 a2e6 d7d8 f7f8,1760,80,83,72,mate mateIn2 middlegame short,https://lichess.org/yyznGmXs/black#34,Italian_Game Italian_Game_Classical_Variation";

describe("parseLichessLine", () => {
  it("lê as colunas do CSV", () => {
    expect(parseLichessLine(line)).toEqual({
      id: "00sHx",
      fen: "q3k1nr/1pp1nQpp/3p4/1P2p3/4P3/B1PP1b2/B5PP/5K2 b k - 0 17",
      moves: "e8d7 a2e6 d7d8 f7f8",
      rating: 1760,
      ratingDeviation: 80,
      popularity: 83,
      plays: 72,
      themes: ["mate", "mateIn2", "middlegame", "short"],
      openingTags: ["Italian_Game", "Italian_Game_Classical_Variation"],
    });
  });

  it("aceita linha sem aberturas e recusa linha quebrada", () => {
    const semAbertura = line.split(",").slice(0, 9).join(",");
    expect(parseLichessLine(semAbertura)?.openingTags).toEqual([]);
    expect(parseLichessLine("abc,def")).toBeNull();
    expect(parseLichessLine("x,fen,moves,abc,1,1,1,t,u,")).toBeNull();
  });
});

describe("passesQuality", () => {
  const good = { ...parseLichessLine(line)!, popularity: 95, plays: 5000 };

  it("aceita puzzle popular, jogado e estável", () => {
    expect(passesQuality(good)).toBe(true);
  });

  it("recusa pouco jogado, impopular, instável, longo ou fora da faixa", () => {
    expect(passesQuality({ ...good, plays: 50 })).toBe(false);
    expect(passesQuality({ ...good, popularity: 60 })).toBe(false);
    expect(passesQuality({ ...good, ratingDeviation: 200 })).toBe(false);
    expect(passesQuality({ ...good, moves: "a1a2 ".repeat(12).trim() })).toBe(
      false,
    );
    expect(passesQuality({ ...good, rating: 2900 })).toBe(false);
  });
});

describe("BucketSampler", () => {
  const base = { ...parseLichessLine(line)!, popularity: 95, plays: 5000 };

  it("limita cada faixa de rating", () => {
    const sampler = new BucketSampler(BUCKET_COUNT * 2); // 2 por faixa
    expect(sampler.offer({ ...base, id: "a", rating: 1210 })).toBe(true);
    expect(sampler.offer({ ...base, id: "b", rating: 1250 })).toBe(true);
    expect(sampler.offer({ ...base, id: "c", rating: 1299 })).toBe(false);
    expect(sampler.offer({ ...base, id: "d", rating: 1300 })).toBe(true);
    expect(sampler.total).toBe(3);
  });

  it("fica cheio quando atinge o limite", () => {
    const sampler = new BucketSampler(1);
    sampler.offer({ ...base, rating: 900 });
    expect(sampler.full).toBe(true);
  });

  it("calcula a faixa", () => {
    expect(ratingBucket(600)).toBe(0);
    expect(ratingBucket(2599)).toBe(BUCKET_COUNT - 1);
  });
});

describe("toPuzzleRow", () => {
  it("monta a linha da tabela puzzles", () => {
    expect(toPuzzleRow(parseLichessLine(line)!)).toMatchObject({
      id: "00sHx",
      first_move_is_setup: true,
      source: "lichess",
      opening_tags: ["Italian_Game", "Italian_Game_Classical_Variation"],
    });
  });
});
