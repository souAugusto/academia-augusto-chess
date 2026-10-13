import { QUESTIONS } from "./questions";
import { STYLE_IDS, type ResultStyle, type StyleId } from "./styles";

// Diferença mínima entre os dois estilos mais pontuados. Abaixo disso, Universal.
export const UNIVERSAL_GAP = 2;

export type Answers = Record<string, string>; // id da pergunta -> id da opção
export type Scores = Record<StyleId, number>;

export type StyleOutcome = {
  style: ResultStyle;
  scores: Scores;
  percents: Record<StyleId, number>; // parte de cada estilo no total de pontos
  ranking: StyleId[]; // do mais pontuado ao menos
};

// Respostas válidas: uma opção existente para cada uma das perguntas.
export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((question) =>
    question.options.some((option) => option.id === answers[question.id]),
  );
}

export function scoreAnswers(answers: Answers): StyleOutcome {
  const scores = Object.fromEntries(STYLE_IDS.map((id) => [id, 0])) as Scores;
  for (const question of QUESTIONS) {
    const option = question.options.find(
      (item) => item.id === answers[question.id],
    );
    if (option) scores[option.style] += option.points;
  }
  const total = STYLE_IDS.reduce((sum, id) => sum + scores[id], 0);
  const ranking = [...STYLE_IDS].sort((a, b) => scores[b] - scores[a]);
  const percents = Object.fromEntries(
    STYLE_IDS.map((id) => [
      id,
      total ? Math.round((scores[id] / total) * 100) : 0,
    ]),
  ) as Record<StyleId, number>;
  const [first, second] = ranking;
  const style: ResultStyle =
    scores[first] - scores[second] < UNIVERSAL_GAP ? "universal" : first;
  return { style, scores, percents, ranking };
}
