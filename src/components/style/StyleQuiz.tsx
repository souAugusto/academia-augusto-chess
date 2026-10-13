"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState, useTransition } from "react";
import { saveStyleResult } from "@/app/(app)/questionario/actions";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { QUESTIONS } from "@/lib/style/questions";
import type { StyleOutcome } from "@/lib/style/scoring";
import { StyleResult } from "./StyleResult";

// Questionário de estilo: uma pergunta por tela, com barra de progresso.
export function StyleQuiz({ next }: { next: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState<StyleOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const question = QUESTIONS[step];
  const chosen = question ? answers[question.id] : undefined;
  const last = step === QUESTIONS.length - 1;
  const progress = Math.round(
    (Object.keys(answers).length / QUESTIONS.length) * 100,
  );

  function choose(optionId: string) {
    setAnswers((current) => ({ ...current, [question.id]: optionId }));
    setError(null);
  }

  function finish() {
    startSaving(async () => {
      const response = await saveStyleResult(answers);
      if (response.ok) setOutcome(response.outcome);
      else setError(response.error);
    });
  }

  if (outcome)
    return (
      <div className="flex flex-col gap-6">
        <StyleResult style={outcome.style} percents={outcome.percents} />
        <div className="flex flex-wrap gap-3">
          <Link href={next} className={buttonClasses("primary")}>
            Continuar
          </Link>
          <button
            type="button"
            onClick={() => {
              setOutcome(null);
              setAnswers({});
              setStep(0);
            }}
            className={buttonClasses("secondary")}
          >
            Refazer
          </button>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-muted">
          <span>
            Pergunta {step + 1} de {QUESTIONS.length}
          </span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Progresso do questionário"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 overflow-hidden rounded-full bg-surface-2"
        >
          <motion.div
            className="h-full rounded-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.fieldset
          key={question.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3"
        >
          <legend className="mb-3 text-lg leading-snug font-semibold">
            {question.text}
          </legend>
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex min-h-touch cursor-pointer items-center gap-3 rounded-control border p-4 transition ${
                chosen === option.id
                  ? "border-accent bg-surface-2 ring-1 ring-accent"
                  : "border-border hover:border-border-strong"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={chosen === option.id}
                onChange={() => choose(option.id)}
                className="size-4 shrink-0 accent-accent"
              />
              <span className="leading-relaxed">{option.text}</span>
            </label>
          ))}
        </motion.fieldset>
      </AnimatePresence>

      {error && <FormAlert tone="erro">{error}</FormAlert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((value) => Math.max(0, value - 1))}
          disabled={step === 0}
          className={buttonClasses("secondary")}
        >
          Voltar
        </button>
        <Link
          href={next}
          className="order-last w-full text-center text-sm text-muted underline-offset-4 hover:text-text hover:underline sm:order-none sm:w-auto"
        >
          Pular por agora
        </Link>
        {last ? (
          <button
            type="button"
            onClick={finish}
            disabled={!chosen || saving}
            className={buttonClasses("primary")}
          >
            {saving ? "Calculando..." : "Ver meu estilo"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((value) => value + 1)}
            disabled={!chosen}
            className={buttonClasses("primary")}
          >
            Próxima
          </button>
        )}
      </div>
    </div>
  );
}
