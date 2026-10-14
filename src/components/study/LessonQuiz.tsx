"use client";

import { useState } from "react";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { buttonClasses } from "@/components/ui/button";
import type { QuizQuestion } from "@/content/licoes/types";

// Mini-quiz: uma pergunta por vez, com a explicação logo depois da resposta.
export function LessonQuiz({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = questions[index];

  if (finished)
    return (
      <div className="flex flex-col items-start gap-4" aria-live="polite">
        <p className="font-display text-3xl font-semibold">
          {score} de {questions.length}
        </p>
        <p className="text-muted">
          {score === questions.length
            ? "Perfeito: você entendeu as ideias principais."
            : "Releia as explicações das perguntas que errou e tente de novo quando quiser."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setChosen(null);
            setScore(0);
            setFinished(false);
          }}
          className={buttonClasses("secondary")}
        >
          Refazer o quiz
        </button>
      </div>
    );

  function answer(option: number) {
    if (chosen !== null) return;
    setChosen(option);
    if (option === question.answer) setScore((value) => value + 1);
  }

  function next() {
    if (index + 1 >= questions.length) {
      const final = score;
      setFinished(true);
      onFinish(final);
      return;
    }
    setIndex((value) => value + 1);
    setChosen(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Pergunta {index + 1} de {questions.length}
      </p>
      {question.fen && (
        <div className="max-w-xs">
          <StaticBoard
            fen={question.fen}
            orientation={question.fen.split(" ")[1] === "b" ? "b" : "w"}
            label="Posição da pergunta"
          />
        </div>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-lg leading-snug font-semibold">
          {question.question}
        </legend>
        {question.options.map((option, optionIndex) => {
          const isRight = optionIndex === question.answer;
          const state =
            chosen === null
              ? "border-border hover:border-border-strong"
              : isRight
                ? "border-success bg-surface-2"
                : optionIndex === chosen
                  ? "border-danger"
                  : "border-border opacity-70";
          return (
            <button
              key={option}
              type="button"
              onClick={() => answer(optionIndex)}
              disabled={chosen !== null}
              className={`min-h-touch rounded-control border p-3 text-left leading-relaxed transition ${state}`}
            >
              {option}
            </button>
          );
        })}
      </fieldset>
      {chosen !== null && (
        <div className="flex flex-col items-start gap-3" aria-live="polite">
          <p
            className={
              chosen === question.answer ? "text-success" : "text-danger"
            }
          >
            {chosen === question.answer ? "Certo! " : "Não é essa. "}
            <span className="text-text">{question.explanation}</span>
          </p>
          <button
            type="button"
            onClick={next}
            className={buttonClasses("primary")}
          >
            {index + 1 >= questions.length
              ? "Ver resultado"
              : "Próxima pergunta"}
          </button>
        </div>
      )}
    </div>
  );
}
