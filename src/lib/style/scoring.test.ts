import { describe, expect, it } from "vitest";
import { QUESTIONS } from "./questions";
import { isComplete, scoreAnswers, type Answers } from "./scoring";
import { STYLE_IDS, STYLES, type StyleId } from "./styles";

// Responde todas as perguntas com a opção do estilo pedido.
function answerAll(style: StyleId): Answers {
  return Object.fromEntries(
    QUESTIONS.map((question) => [
      question.id,
      question.options.find((option) => option.style === style)!.id,
    ]),
  );
}

describe("questionário", () => {
  it("tem 10 perguntas, cada uma com uma opção de cada estilo", () => {
    expect(QUESTIONS).toHaveLength(10);
    for (const question of QUESTIONS) {
      expect(question.options.map((option) => option.style).sort()).toEqual(
        [...STYLE_IDS].sort(),
      );
    }
  });

  it("nenhum estilo sai na frente: mesma pontuação máxima para todos", () => {
    const maxima = STYLE_IDS.map((style) =>
      QUESTIONS.reduce(
        (sum, question) =>
          sum +
          question.options.find((option) => option.style === style)!.points,
        0,
      ),
    );
    expect(new Set(maxima).size).toBe(1);
  });

  it("todo estilo tem textos completos", () => {
    for (const info of Object.values(STYLES)) {
      expect(info.description.length).toBeGreaterThan(40);
      expect(info.strengths.length).toBeGreaterThanOrEqual(2);
      expect(info.toDevelop.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("scoreAnswers", () => {
  it("quem escolhe sempre o mesmo estilo recebe esse estilo", () => {
    for (const style of STYLE_IDS) {
      const outcome = scoreAnswers(answerAll(style));
      expect(outcome.style).toBe(style);
      expect(outcome.percents[style]).toBe(100);
    }
  });

  it("diferença menor que 2 pontos entre os dois primeiros vira Universal", () => {
    // Metade atacante, metade tático: empate ou diferença de 1 ponto.
    const answers = Object.fromEntries(
      QUESTIONS.map((question, index) => [
        question.id,
        question.options.find(
          (option) => option.style === (index < 5 ? "atacante" : "tatico"),
        )!.id,
      ]),
    );
    const outcome = scoreAnswers(answers);
    expect(
      Math.abs(outcome.scores.atacante - outcome.scores.tatico),
    ).toBeLessThan(2);
    expect(outcome.style).toBe("universal");
  });

  it("percentuais somam perto de 100 e o ranking vem ordenado", () => {
    const answers = answerAll("posicional");
    answers[QUESTIONS[0].id] = "a"; // uma resposta de atacante
    const outcome = scoreAnswers(answers);
    const sum = Object.values(outcome.percents).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
    expect(outcome.ranking[0]).toBe("posicional");
  });

  it("isComplete exige uma opção válida para cada pergunta", () => {
    expect(isComplete(answerAll("defensor"))).toBe(true);
    const partial = answerAll("defensor");
    delete partial[QUESTIONS[3].id];
    expect(isComplete(partial)).toBe(false);
    expect(
      isComplete({ ...answerAll("defensor"), [QUESTIONS[0].id]: "z" }),
    ).toBe(false);
  });
});
