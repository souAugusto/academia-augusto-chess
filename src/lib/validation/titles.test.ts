import { describe, expect, it } from "vitest";
import { slugify, titleSchema } from "./titles";

const base = {
  name: "Peão Valente",
  minRating: "900",
  tagline: "",
  color: "#C9D6CE",
};

describe("titleSchema", () => {
  it("aceita um título da escada", () => {
    expect(titleSchema.parse(base).minRating).toBe(900);
  });
  it("recusa títulos oficiais", () => {
    for (const name of [
      "Grande Mestre",
      "Mestre FIDE",
      "Mestre Nacional",
      "GM Tático",
      "Candidato a Mestre",
    ])
      expect(titleSchema.safeParse({ ...base, name }).success).toBe(false);
  });
  it("aceita nomes da escada que só contêm a palavra mestre", () => {
    expect(
      titleSchema.safeParse({ ...base, name: "Mestre das Táticas" }).success,
    ).toBe(true);
  });
  it("recusa cor e rating inválidos", () => {
    expect(titleSchema.safeParse({ ...base, color: "red" }).success).toBe(
      false,
    );
    expect(titleSchema.safeParse({ ...base, minRating: "-5" }).success).toBe(
      false,
    );
  });
});

describe("slugify", () => {
  it("gera slug sem acento", () => {
    expect(slugify("Caçador de Táticas")).toBe("cacador-de-taticas");
  });
});
