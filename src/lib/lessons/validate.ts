import { Chess, validateFen } from "chess.js";
import type {
  EndgameLesson,
  ExplainedMove,
  Lesson,
  OpeningLesson,
  QuizQuestion,
} from "../../content/licoes/types.ts";

// Conferência do conteúdo das lições: todo lance precisa ser legal, todo FEN
// válido e toda prática precisa ter solução. Devolve a lista de problemas
// (vazia = conteúdo ok). Usado no build (scripts/validar-conteudo.ts) e nos testes.

const LEVELS = ["facil", "medio", "dificil"] as const;

function playLine(
  start: string | null,
  sans: string[],
  where: string,
  errors: string[],
): Chess | null {
  const chess = start ? new Chess(start) : new Chess();
  for (const [index, san] of sans.entries()) {
    try {
      chess.move(san);
    } catch {
      errors.push(
        `${where}: lance ${index + 1} "${san}" é ilegal na posição ${chess.fen()}`,
      );
      return null;
    }
  }
  return chess;
}

const sansOf = (moves: ExplainedMove[]) => moves.map((move) => move.san);

function checkFen(fen: string, where: string, errors: string[]): boolean {
  const result = validateFen(fen);
  if (!result.ok) {
    errors.push(`${where}: FEN inválido (${result.error}): ${fen}`);
    return false;
  }
  try {
    new Chess(fen);
    return true;
  } catch (error) {
    errors.push(
      `${where}: FEN recusado pelo chess.js: ${fen} (${String(error)})`,
    );
    return false;
  }
}

function checkText(value: unknown, where: string, errors: string[]) {
  if (typeof value !== "string" || value.trim().length < 3)
    errors.push(`${where}: texto vazio`);
}

function checkQuiz(quiz: QuizQuestion[], where: string, errors: string[]) {
  if (quiz.length < 3 || quiz.length > 5)
    errors.push(
      `${where}: o quiz precisa de 3 a 5 perguntas (tem ${quiz.length})`,
    );
  quiz.forEach((question, index) => {
    const at = `${where} pergunta ${index + 1}`;
    checkText(question.question, at, errors);
    checkText(question.explanation, `${at} explicação`, errors);
    if (question.options.length < 2)
      errors.push(`${at}: precisa de pelo menos 2 opções`);
    if (
      !Number.isInteger(question.answer) ||
      question.answer < 0 ||
      question.answer >= question.options.length
    )
      errors.push(`${at}: resposta fora das opções`);
    if (new Set(question.options).size !== question.options.length)
      errors.push(`${at}: opções repetidas`);
    if (question.fen) checkFen(question.fen, at, errors);
  });
}

export function validateOpening(lesson: OpeningLesson): string[] {
  const errors: string[] = [];
  const where = `abertura ${lesson.slug}`;
  checkText(lesson.title, `${where} título`, errors);
  checkText(lesson.summary, `${where} resumo`, errors);
  if (lesson.intro.length === 0) errors.push(`${where}: sem introdução`);
  if (lesson.styles.length === 0) errors.push(`${where}: sem estilo indicado`);
  if (lesson.ideas.white.length === 0 || lesson.ideas.black.length === 0)
    errors.push(`${where}: faltam planos de um dos lados`);
  if (lesson.mainLine.length < 4)
    errors.push(`${where}: linha principal curta`);
  if (!lesson.mainLine.some((move) => move.note))
    errors.push(`${where}: linha principal sem explicações`);
  playLine(null, sansOf(lesson.mainLine), `${where} linha principal`, errors);
  lesson.variations.forEach((variation) =>
    playLine(
      null,
      sansOf(variation.moves),
      `${where} variante "${variation.name}"`,
      errors,
    ),
  );
  if (lesson.traps.length === 0) errors.push(`${where}: sem armadilhas`);
  lesson.traps.forEach((trap) =>
    playLine(null, trap.moves, `${where} armadilha "${trap.name}"`, errors),
  );
  if (lesson.mistakes.length === 0) errors.push(`${where}: sem erros comuns`);

  for (const level of LEVELS)
    if (!lesson.practice.some((drill) => drill.level === level))
      errors.push(`${where}: falta prática no nível ${level}`);
  lesson.practice.forEach((drill, index) => {
    const at = `${where} prática ${index + 1}`;
    checkText(drill.hint, `${at} dica`, errors);
    checkText(drill.why, `${at} explicação`, errors);
    const chess = playLine(null, drill.before, at, errors);
    if (!chess) return;
    for (const san of [drill.answer, ...(drill.alternatives ?? [])]) {
      try {
        new Chess(chess.fen()).move(san);
      } catch {
        errors.push(
          `${at}: resposta "${san}" é ilegal na posição ${chess.fen()}`,
        );
      }
    }
    // O aluno joga com a cor da lição.
    const turn = chess.turn() === "w" ? "brancas" : "pretas";
    if (turn !== lesson.side)
      errors.push(
        `${at}: é a vez das ${turn}, mas a lição é com as ${lesson.side}`,
      );
  });
  checkQuiz(lesson.quiz, where, errors);
  return errors;
}

export function validateEndgame(lesson: EndgameLesson): string[] {
  const errors: string[] = [];
  const where = `final ${lesson.slug}`;
  checkText(lesson.title, `${where} título`, errors);
  checkText(lesson.summary, `${where} resumo`, errors);
  if (lesson.theory.length === 0) errors.push(`${where}: sem teoria`);
  if (lesson.keyPoints.length === 0) errors.push(`${where}: sem pontos-chave`);
  if (checkFen(lesson.model.fen, `${where} modelo`, errors))
    playLine(
      lesson.model.fen,
      sansOf(lesson.model.moves),
      `${where} modelo`,
      errors,
    );
  if (lesson.practice.length < 5)
    errors.push(
      `${where}: precisa de pelo menos 5 posições de prática (tem ${lesson.practice.length})`,
    );
  const fens = new Set<string>();
  lesson.practice.forEach((drill, index) => {
    const at = `${where} prática ${index + 1}`;
    checkText(drill.hint, `${at} dica`, errors);
    checkText(drill.why, `${at} explicação`, errors);
    if (fens.has(drill.fen)) errors.push(`${at}: posição repetida`);
    fens.add(drill.fen);
    if (!checkFen(drill.fen, at, errors)) return;
    if (drill.solution.length === 0) {
      errors.push(`${at}: sem solução definida`);
      return;
    }
    const start = new Chess(drill.fen);
    if (start.isGameOver()) errors.push(`${at}: a posição já terminou`);
    playLine(drill.fen, drill.solution, `${at} solução`, errors);
    for (const san of drill.accept ?? []) {
      try {
        new Chess(drill.fen).move(san);
      } catch {
        errors.push(`${at}: alternativa "${san}" é ilegal`);
      }
    }
  });
  checkQuiz(lesson.quiz, where, errors);
  return errors;
}

export function validateLessons(lessons: Lesson[]): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  for (const lesson of lessons) {
    if (!/^[a-z0-9-]{2,60}$/.test(lesson.slug))
      errors.push(`slug inválido: ${lesson.slug}`);
    if (slugs.has(lesson.slug)) errors.push(`slug repetido: ${lesson.slug}`);
    slugs.add(lesson.slug);
    errors.push(
      ...(lesson.kind === "abertura"
        ? validateOpening(lesson)
        : validateEndgame(lesson)),
    );
  }
  return errors;
}
