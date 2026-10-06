import { describe, expect, it } from "vitest";
import { findPlaceholders } from "./placeholders";

describe("findPlaceholders", () => {
  it("acha placeholder com acento e espaços", () => {
    expect(findPlaceholders("<p>Live: [DIA E HORÁRIO DA LIVE]</p>")).toEqual([
      { line: 1, text: "[DIA E HORÁRIO DA LIVE]" },
    ]);
  });

  it("informa a linha correta", () => {
    const source =
      "const a = 1;\nconst b = 2;\nconst texto = '[EMAIL DE SUPORTE]';";
    expect(findPlaceholders(source)).toEqual([
      { line: 3, text: "[EMAIL DE SUPORTE]" },
    ]);
  });

  it("acha os placeholders dos desenhos, inclusive com minúsculas depois", () => {
    const desenhos = [
      "[DIA E HORÁRIO DA LIVE]",
      "[DEFINIR DURAÇÃO E ESTRUTURA REAL DO MÉTODO ANTES DE PUBLICAR]",
      "[DEFINIR BENEFÍCIO DO FUNDADOR: preço travado, selo no ranking ou outro]",
    ];
    for (const texto of desenhos) {
      expect(findPlaceholders(`<p>${texto}</p>`)).toEqual([
        { line: 1, text: texto },
      ]);
    }
  });

  it("acha mais de um na mesma linha", () => {
    expect(findPlaceholders("[NOME] e [FOTO]")).toHaveLength(2);
  });

  it("ignora acesso a índice e tipos de array", () => {
    expect(findPlaceholders("const x = MAPA[CHAVE];")).toEqual([]);
    expect(findPlaceholders("let lista: string[] = [];")).toEqual([]);
    expect(findPlaceholders("fn()[ABC]")).toEqual([]);
  });

  it("ignora colchetes com minúsculas e siglas curtas", () => {
    expect(findPlaceholders("[nome do aluno]")).toEqual([]);
    expect(findPlaceholders("[OK]")).toEqual([]);
  });
});
