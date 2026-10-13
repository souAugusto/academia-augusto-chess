"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { saveLessonProgress } from "@/app/(app)/licoes/actions";
import { FormAlert } from "@/components/forms/Field";
import { StyleBadge } from "@/components/style/StyleBadge";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import type { Lesson } from "@/content/licoes/types";
import type { ResultStyle } from "@/lib/style/styles";
import { MoveSequenceViewer } from "./MoveSequenceViewer";
import { LessonQuiz } from "./LessonQuiz";
import {
  PracticePanel,
  fromEndgameDrills,
  fromOpeningDrills,
} from "./PracticePanel";

type Section = { id: string; label: string };

export function LessonView({
  lesson,
  header,
  myStyle,
  initialSolved,
  initialCompleted,
}: {
  lesson: Lesson;
  header: ReactNode;
  myStyle: ResultStyle | null;
  initialSolved: number;
  initialCompleted: boolean;
}) {
  const opening = lesson.kind === "abertura";
  const sections: Section[] = opening
    ? [
        { id: "intro", label: "Introdução" },
        { id: "linha", label: "Passo a passo" },
        { id: "armadilhas", label: "Armadilhas" },
        { id: "pratica", label: "Prática" },
        { id: "quiz", label: "Quiz" },
      ]
    : [
        { id: "intro", label: "Teoria" },
        { id: "linha", label: "Posição-modelo" },
        { id: "pratica", label: "Prática" },
        { id: "quiz", label: "Quiz" },
      ];
  const [section, setSection] = useState("intro");
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(initialCompleted);
  const [saveError, setSaveError] = useState(false);
  const [, startSaving] = useTransition();
  const orientation = opening
    ? lesson.side === "brancas"
      ? "w"
      : "b"
    : lesson.model.orientation === "white"
      ? "w"
      : "b";
  const drills = opening
    ? fromOpeningDrills(lesson.practice)
    : fromEndgameDrills(lesson.practice);

  function save(input: { practiceSolved?: number; quizScore?: number }) {
    startSaving(async () => {
      const result = await saveLessonProgress({ slug: lesson.slug, ...input });
      setSaveError(!result.ok);
      if (result.completed) setCompleted(true);
    });
  }

  function onSolved(index: number) {
    if (solved.has(index)) return;
    const next = new Set(solved).add(index);
    setSolved(next);
    save({ practiceSolved: next.size });
  }

  const head = <div>{header}</div>;
  const sectionTitle = (text: string) => (
    <div className="flex flex-col gap-1">
      {head}
      <h2 className="text-lg font-semibold">{text}</h2>
    </div>
  );
  const index = sections.findIndex((item) => item.id === section);
  const nextSection = sections[index + 1];

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Partes da lição" className="-mx-4 overflow-x-auto px-4">
        <ol className="flex gap-1 whitespace-nowrap">
          {sections.map((item, position) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSection(item.id)}
                aria-current={section === item.id ? "step" : undefined}
                className={`inline-flex min-h-touch items-center gap-2 rounded-control px-3 text-[0.9375rem] transition ${
                  section === item.id
                    ? "bg-surface-2 font-semibold text-text"
                    : "text-muted hover:text-text"
                }`}
              >
                <span className="text-xs text-accent-text">{position + 1}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {completed && (
        <FormAlert tone="sucesso">
          Lição concluída. Você pode revisar qualquer parte quando quiser.
        </FormAlert>
      )}
      {saveError && (
        <FormAlert tone="erro">
          Não foi possível salvar seu progresso agora. Ele volta a ser salvo no
          próximo acerto.
        </FormAlert>
      )}

      {section === "intro" && (
        <div className="flex max-w-3xl flex-col gap-5">
          {head}
          <div className="flex flex-col gap-3 leading-relaxed">
            {(opening ? lesson.intro : lesson.theory).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {opening && (
            <Card className="flex flex-col gap-3">
              <h2 className="font-semibold">Para quais estilos</h2>
              <div className="flex flex-wrap gap-2">
                {lesson.styles.map((style) => (
                  <StyleBadge key={style} style={style} size="sm" />
                ))}
              </div>
              <p className="text-sm text-muted">
                {myStyle
                  ? lesson.styles.includes(myStyle)
                    ? "Combina com o seu estilo de jogo, segundo o seu questionário."
                    : "Não é o tipo de posição mais natural para o seu estilo: um bom treino para ampliar seu repertório."
                  : null}
                {!myStyle && (
                  <Link
                    href={`/questionario?next=${encodeURIComponent(`/licoes/${lesson.slug}`)}`}
                    className="text-accent-text underline-offset-4 hover:underline"
                  >
                    Descubra seu estilo de jogo em 2 minutos
                  </Link>
                )}
              </p>
            </Card>
          )}
          {opening ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="flex flex-col gap-2">
                <h2 className="font-semibold">Planos das brancas</h2>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem]">
                  {lesson.ideas.white.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </Card>
              <Card className="flex flex-col gap-2">
                <h2 className="font-semibold">Planos das pretas</h2>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem]">
                  {lesson.ideas.black.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
              </Card>
              <Card className="flex flex-col gap-2 md:col-span-2">
                <h2 className="font-semibold">Estrutura de peões</h2>
                <p className="text-[0.9375rem] leading-relaxed">
                  {lesson.structure}
                </p>
              </Card>
            </div>
          ) : (
            <Card className="flex flex-col gap-2">
              <h2 className="font-semibold">Pontos-chave</h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem]">
                {lesson.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {section === "linha" &&
        (opening ? (
          <OpeningLines
            lesson={lesson}
            orientation={orientation}
            title={sectionTitle}
          />
        ) : (
          <MoveSequenceViewer
            id="licao-modelo"
            startFen={lesson.model.fen}
            moves={lesson.model.moves}
            orientation={orientation}
            info={sectionTitle("Posição-modelo")}
            intro={lesson.model.caption}
          />
        ))}

      {section === "armadilhas" && opening && (
        <Traps lesson={lesson} orientation={orientation} title={sectionTitle} />
      )}

      {section === "pratica" && (
        <PracticePanel
          drills={drills}
          orientation={opening ? orientation : undefined}
          info={sectionTitle("Prática")}
          solved={solved}
          onSolved={onSolved}
        />
      )}

      {section === "quiz" && (
        <div className="flex max-w-2xl flex-col gap-4">
          {sectionTitle("Quiz")}
          <Card>
            <LessonQuiz
              questions={lesson.quiz}
              onFinish={(score) =>
                save({ quizScore: score, practiceSolved: solved.size })
              }
            />
          </Card>
          <p className="text-sm text-muted">
            A lição conta como concluída com 70% da prática resolvida e 60% de
            acertos no quiz.
            {initialSolved > 0 &&
              ` Sua melhor marca na prática: ${initialSolved} de ${lesson.practice.length}.`}
          </p>
        </div>
      )}

      {nextSection && (
        <div>
          <button
            type="button"
            onClick={() => setSection(nextSection.id)}
            className={buttonClasses("secondary")}
          >
            Próximo: {nextSection.label}
          </button>
        </div>
      )}
    </div>
  );
}

function OpeningLines({
  lesson,
  orientation,
  title,
}: {
  lesson: Extract<Lesson, { kind: "abertura" }>;
  orientation: "w" | "b";
  title: (text: string) => ReactNode;
}) {
  const lines = [
    { name: "Linha principal", moves: lesson.mainLine, text: "" },
    ...lesson.variations,
  ];
  const [current, setCurrent] = useState(0);
  const line = lines[current];
  return (
    <div className="flex flex-col gap-4">
      {lines.length > 1 && (
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Variantes"
        >
          {lines.map((item, index) => (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={current === index}
              onClick={() => setCurrent(index)}
              className={buttonClasses(
                current === index ? "primary" : "secondary",
              )}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      <MoveSequenceViewer
        key={line.name}
        id="licao-linha"
        moves={line.moves}
        orientation={orientation}
        info={
          <>
            {title(line.name)}
            {line.text && (
              <p className="text-[0.9375rem] leading-relaxed text-muted">
                {line.text}
              </p>
            )}
          </>
        }
      />
    </div>
  );
}

function Traps({
  lesson,
  orientation,
  title,
}: {
  lesson: Extract<Lesson, { kind: "abertura" }>;
  orientation: "w" | "b";
  title: (text: string) => ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const trap = lesson.traps[current];
  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Armadilhas"
      >
        {lesson.traps.map((item, index) => (
          <button
            key={item.name}
            type="button"
            role="tab"
            aria-selected={current === index}
            onClick={() => setCurrent(index)}
            className={buttonClasses(
              current === index ? "primary" : "secondary",
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
      <MoveSequenceViewer
        key={trap.name}
        id="licao-armadilha"
        moves={trap.moves.map((san) => ({ san }))}
        orientation={orientation}
        info={
          <>
            {title(trap.name)}
            <p className="text-[0.9375rem] leading-relaxed">{trap.text}</p>
          </>
        }
      />
      <Card className="flex max-w-3xl flex-col gap-2">
        <h2 className="font-semibold">Erros comuns</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem]">
          {lesson.mistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
