import Link from "next/link";
import { CLASS_STYLE } from "@/components/analysis/classStyle";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import {
  ANALYSIS_SECTION,
  EQUATION,
  IMPORT_SECTION,
  LESSONS_SECTION,
  PROBLEM,
  STYLE_SECTION,
} from "@/content/home";
import { CLASS_LABELS, type MoveClass } from "@/lib/analysis/review";
import { STYLES } from "@/lib/style/styles";
import { Section, SectionHeading } from "./Section";

const Illustrative = ({ label }: { label: string }) => (
  <span className="self-start rounded-full border border-border px-2.5 py-0.5 text-xs text-muted">
    {label}
  </span>
);

export function ProblemSection() {
  return (
    <Section id="problema" className="py-20">
      <SectionHeading label={PROBLEM.label} title={PROBLEM.title} />
      <ul className="grid gap-5 md:grid-cols-3">
        {PROBLEM.points.map((point) => (
          <li
            key={point.title}
            className="flex flex-col gap-2 border-t border-border-strong pt-5"
          >
            <h3 className="text-lg font-semibold">{point.title}</h3>
            <p className="leading-relaxed text-muted">{point.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function StyleSection() {
  const style = STYLES.tatico;
  return (
    <Section id="estilo" className="pb-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <SectionHeading
          label={STYLE_SECTION.label}
          title={STYLE_SECTION.title}
          text={STYLE_SECTION.text}
        />
        <Card className="flex flex-col gap-4 p-7">
          <Illustrative label={STYLE_SECTION.previewLabel} />
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${style.badge}`}
            >
              {style.name}
            </span>
            <span className="text-sm text-muted">seu estilo</span>
          </div>
          <p className="leading-relaxed text-muted">{style.description}</p>
          <div>
            <p className="mb-2 text-sm font-semibold">Pontos fortes</p>
            <ul className="flex flex-wrap gap-2">
              {style.strengths.map((item) => (
                <li
                  key={item}
                  className="rounded-control bg-surface-2 px-3 py-1 text-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </Section>
  );
}

const MOCK_OPENINGS = [
  { name: "Siciliana", games: 34, wins: 55 },
  { name: "Italiana", games: 21, wins: 48 },
  { name: "Caro-Kann", games: 12, wins: 42 },
];

export function ImportSection() {
  return (
    <Section
      id="partidas"
      className="border-y border-border bg-surface/40 py-20"
    >
      <div className="grid items-center gap-10 md:grid-cols-2">
        <Card className="order-2 flex flex-col gap-4 p-7 md:order-1">
          <Illustrative label={IMPORT_SECTION.mockupLabel} />
          <p className="font-semibold">Aberturas mais jogadas</p>
          <ul className="flex flex-col gap-3">
            {MOCK_OPENINGS.map((item) => (
              <li key={item.name} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-muted">
                    {item.games} partidas · {item.wins}% de vitórias
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${item.wins}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <div className="order-1 md:order-2">
          <SectionHeading
            label={IMPORT_SECTION.label}
            title={IMPORT_SECTION.title}
            text={IMPORT_SECTION.text}
          />
        </div>
      </div>
    </Section>
  );
}

const MOCK_MOVES: { label: string; cls: MoveClass }[] = [
  { label: "12.Cd5", cls: "melhor" },
  { label: "12...exd5", cls: "bom" },
  { label: "13.exd5", cls: "excelente" },
  { label: "13...Dc7", cls: "imprecisao" },
  { label: "14.Te1", cls: "melhor" },
  { label: "14...Bf5??", cls: "gafe" },
];
// Chance das brancas (0 a 100) ao longo do exemplo.
const MOCK_CURVE = [52, 54, 50, 55, 58, 57, 61, 60, 72, 70, 92, 94];

export function AnalysisSection({ free }: { free: boolean }) {
  const width = 300;
  const height = 80;
  const step = width / (MOCK_CURVE.length - 1);
  const line = MOCK_CURVE.map(
    (value, i) => `${i * step},${height - (value / 100) * height}`,
  ).join(" ");
  return (
    <Section id="analise" className="py-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SectionHeading
            label={ANALYSIS_SECTION.label}
            title={ANALYSIS_SECTION.title}
            text={ANALYSIS_SECTION.text}
          />
          <p className="font-semibold text-accent-text">
            {free ? ANALYSIS_SECTION.freeNote : ANALYSIS_SECTION.paidNote}
          </p>
        </div>
        <Card className="flex flex-col gap-4 p-7">
          <Illustrative label={ANALYSIS_SECTION.mockupLabel} />
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-24 w-full rounded-control border border-border bg-eval-dark"
            role="img"
            aria-label="Exemplo de gráfico de avaliação"
          >
            <polygon
              points={`0,${height} ${line} ${width},${height}`}
              fill="var(--color-eval-light)"
            />
          </svg>
          <ul className="grid grid-cols-2 gap-2">
            {MOCK_MOVES.map((move) => (
              <li
                key={move.label}
                className="flex items-center justify-between rounded-control bg-surface-2 px-3 py-1.5 font-mono text-sm"
              >
                <span>{move.label}</span>
                <span
                  className={CLASS_STYLE[move.cls].text}
                  title={CLASS_LABELS[move.cls]}
                >
                  {CLASS_STYLE[move.cls].symbol}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Precisão: 91,2% contra 74,5% · 3 momentos críticos
          </p>
        </Card>
      </div>
    </Section>
  );
}

export function EquationSection() {
  return (
    <Section
      id="sob-medida"
      className="border-y border-border bg-surface/40 py-20"
    >
      <SectionHeading label={EQUATION.label} title={EQUATION.title} center />
      <ol className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        {EQUATION.parts.map((part, index) => (
          <li key={part.title} className="contents">
            <Card className="flex flex-col gap-2 p-5">
              <h3 className="font-semibold">{part.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{part.text}</p>
            </Card>
            <span
              aria-hidden="true"
              className="self-center text-center font-display text-3xl text-accent-text"
            >
              {index < EQUATION.parts.length - 1 ? "+" : "="}
            </span>
          </li>
        ))}
        <li>
          <Card className="flex h-full flex-col gap-2 p-5" highlight>
            <h3 className="font-semibold text-accent-text">
              {EQUATION.result.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {EQUATION.result.text}
            </p>
          </Card>
        </li>
      </ol>
    </Section>
  );
}

export function LessonsSection({
  counts,
}: {
  counts: {
    openingLessons: number;
    openingDrills: number;
    endgameLessons: number;
    endgamePositions: number;
  };
}) {
  const items = [
    {
      ...LESSONS_SECTION.openings,
      numbers: `${counts.openingLessons} lições · ${counts.openingDrills} exercícios`,
    },
    {
      ...LESSONS_SECTION.endgames,
      numbers: `${counts.endgameLessons} lições · ${counts.endgamePositions} posições para praticar`,
    },
  ];
  return (
    <Section id="licoes" className="py-20">
      <SectionHeading
        label={LESSONS_SECTION.label}
        title={LESSONS_SECTION.title}
      />
      <ul className="grid gap-5 md:grid-cols-2">
        {items.map((item) => (
          <Card as="li" key={item.title} className="flex flex-col gap-3 p-7">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="font-display text-2xl text-accent-text">
              {item.numbers}
            </p>
            <p className="leading-relaxed text-muted">{item.text}</p>
          </Card>
        ))}
      </ul>
      <div>
        <Link href="#planos" className={buttonClasses("primary")}>
          Ver planos
        </Link>
      </div>
    </Section>
  );
}
