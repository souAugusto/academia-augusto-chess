import { describe, expect, it } from "vitest";
import { initials, nextNicknameChange, nicknameProblem } from "./nickname";

describe("nicknameProblem", () => {
  it("aceita apelidos comuns", () => {
    for (const ok of ["joao_silva", "Rei.Negro", "tatica-2024", "abc"])
      expect(nicknameProblem(ok)).toBeNull();
  });

  it("recusa formato inválido", () => {
    for (const bad of ["ab", "a".repeat(21), "joão", "com espaço", "x<y>"])
      expect(nicknameProblem(bad)).toBe("formato");
  });

  it("recusa nomes reservados, com variações", () => {
    for (const bad of [
      "admin",
      "ADMIN",
      "Augusto",
      "augusto_chess",
      "Sup0rte",
      "admin_joao",
      "finale.oficial",
    ])
      expect(nicknameProblem(bad)).toBe("reservado");
  });

  it("recusa palavrões, inclusive com números e separadores", () => {
    for (const bad of ["porra", "P0RR4", "putaria", "x_puta", "merda123"])
      expect(nicknameProblem(bad)).toBe("proibido");
  });

  it("não bloqueia palavras inocentes que contêm um trecho proibido", () => {
    for (const ok of ["computador", "disputa", "augustinho", "amacacado"])
      expect(nicknameProblem(ok)).toBeNull();
  });
});

describe("nextNicknameChange", () => {
  const now = new Date("2026-10-14T12:00:00Z");
  it("sem troca anterior, pode trocar", () => {
    expect(nextNicknameChange(null, now)).toBeNull();
  });
  it("trocou há 10 dias: espera mais 20", () => {
    const next = nextNicknameChange(new Date("2026-10-04T12:00:00Z"), now);
    expect(next?.toISOString()).toBe("2026-11-03T12:00:00.000Z");
  });
  it("trocou há 31 dias: pode trocar", () => {
    expect(
      nextNicknameChange(new Date("2026-09-13T12:00:00Z"), now),
    ).toBeNull();
  });
});

describe("initials", () => {
  it("usa duas letras", () => {
    expect(initials("joao_silva")).toBe("JS");
    expect(initials("ana")).toBe("AN");
    expect(initials("")).toBe("?");
  });
});
