import { describe, expect, it } from "vitest";
import {
  addLocalGame,
  gamePgn,
  MAX_LOCAL_GAMES,
  parseLocalGames,
  validateGame,
  type BotGameRecord,
} from "./history";

const BOTS = ["peaozinho-curioso", "o-rei-final"];

// Mate do pastor: as brancas (aluno) vencem.
const GAME: BotGameRecord = {
  id: "0b6c1f2e-5d6a-4c1b-9a3e-2f1d4c5b6a7e",
  botId: "peaozinho-curioso",
  color: "w",
  result: "vitoria",
  reason: "mate",
  stars: 3,
  accuracy: 92,
  moves: ["e2e4", "e7e5", "f1c4", "b8c6", "d1h5", "g8f6", "h5f7"],
  marks: [[2, 1]],
  clock: "sem",
  playedAt: "2026-10-24T23:30:00.000Z",
};

const id = (n: number) => `0b6c1f2e-5d6a-4c1b-9a3e-${String(n).padStart(12, "0")}`;

describe("validação da partida", () => {
  it("aceita uma partida coerente", () => {
    expect(validateGame(GAME, BOTS)).toEqual(GAME);
  });

  it("recusa dados que não batem", () => {
    const bad: Partial<Record<keyof BotGameRecord, unknown>>[] = [
      { id: "abc" },
      { botId: "outro" },
      { color: "x" },
      { result: "ganhou" },
      { reason: "susto" },
      { stars: 4 },
      { accuracy: 101 },
      { moves: ["e2e5"] }, // ilegal
      { moves: ["e2e4", "e7e5"] }, // diz que foi mate, mas não foi
      { marks: [[99, 1]] }, // lance que não existe
      { marks: [[0, 4]] },
      { clock: "1+0" },
      { playedAt: "ontem" },
    ];
    for (const patch of bad) expect(validateGame({ ...GAME, ...patch }, BOTS), JSON.stringify(patch)).toBeNull();
    expect(validateGame({ ...GAME, result: "derrota", reason: "abandono", stars: 2 }, BOTS)).toBeNull();
    expect(validateGame(null, BOTS)).toBeNull();
  });

  it("abandono logo no começo vale, sem lances", () => {
    const resigned = { ...GAME, result: "derrota", reason: "abandono", stars: 0, moves: [], marks: [], accuracy: null };
    expect(validateGame(resigned, BOTS)).not.toBeNull();
    expect(validateGame({ ...resigned, reason: "repeticao" }, BOTS)).toBeNull();
  });
});

describe("partidas no aparelho", () => {
  it("guarda as mais novas primeiro e respeita o limite", () => {
    let list: BotGameRecord[] = [];
    for (let i = 0; i < MAX_LOCAL_GAMES + 5; i += 1) list = addLocalGame(list, { ...GAME, id: id(i) });
    expect(list).toHaveLength(MAX_LOCAL_GAMES);
    expect(list[0].id).toBe(id(MAX_LOCAL_GAMES + 4));
    expect(addLocalGame(list, list[3])).toHaveLength(MAX_LOCAL_GAMES);
  });

  it("descarta itens estranhos ao ler", () => {
    expect(parseLocalGames([GAME, { ...GAME, id: "x" }, 3], BOTS)).toEqual([GAME]);
    expect(parseLocalGames("lixo", BOTS)).toEqual([]);
  });
});

describe("PGN", () => {
  it("tem cabeçalho, data de São Paulo e resultado", () => {
    const pgn = gamePgn(GAME, "Peãozinho Curioso");
    expect(pgn).toContain('[White "Você"]');
    expect(pgn).toContain('[Black "Peãozinho Curioso"]');
    expect(pgn).toContain('[Date "2026.10.24"]');
    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toContain("4. Qxf7#");
    const black = gamePgn({ ...GAME, color: "b", result: "derrota", reason: "abandono", stars: 0 }, "Rei");
    expect(black).toContain('[White "Rei"]');
    expect(black).toContain('[Result "1-0"]');
  });
});
