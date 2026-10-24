import { TitleProgressCard } from "@/components/titles/TitleProgressCard";
import { getMyTitleSummary } from "@/lib/data/titles";
import type { Metadata } from "next";
import Link from "next/link";
import { APP_SECTIONS } from "@/components/app/modules";
import { FormAlert } from "@/components/forms/Field";
import { ProgressFill, Reveal } from "@/components/motion/Reveal";
import { StreakWeek } from "@/components/progress/StreakWeek";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";
import {
  getNextLesson,
  getReviewDueCount,
  getStreak,
  listTrails,
} from "@/lib/data/progress";
import { getMyTacticStats } from "@/lib/data/tactics";
import { getSiteSettings, viewerIsAdmin } from "@/lib/data/site-settings";
import { canSee, visibleSections } from "@/lib/site-settings";
import { STEP_LABELS } from "@/lib/trails";

export const metadata: Metadata = { title: "Painel" };

export default async function PainelPage({
  searchParams,
}: PageProps<"/painel">) {
  const [user, params] = await Promise.all([
    requireUser("/painel"),
    searchParams,
  ]);
  const plan = PLAN_NAMES[user.planRank];
  const [settings, isAdmin] = await Promise.all([
    getSiteSettings(),
    viewerIsAdmin(),
  ]);
  const lessonsOn = canSee("video_lessons_enabled", settings, isAdmin);
  const areas = visibleSections(
    APP_SECTIONS.filter((section) => section.id !== "painel"),
    settings,
    isAdmin,
  );

  if (!plan) {
    return (
      <>
        <Heading name={user.name} />
        {params.senha === "alterada" && (
          <FormAlert tone="sucesso">Sua senha foi alterada.</FormAlert>
        )}
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-accent bg-surface-2 p-6 shadow-card">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              Escolha seu plano para começar
            </h2>
            <p className="text-[0.9375rem] text-muted">
              Sua conta está pronta. O treino abre com a assinatura.
            </p>
          </div>
          <Link href="/planos" className={buttonClasses("primary")}>
            Ver planos
          </Link>
        </section>
        <p className="text-[0.9375rem] text-muted">
          Enquanto isso, você pode{" "}
          <Link
            href="/jogar"
            className="font-semibold text-accent-text hover:underline"
          >
            jogar contra o computador
          </Link>
          , aberto a todos.
        </p>
      </>
    );
  }

  const [stats, streak, reviewDue, nextLesson, trails, titles] =
    await Promise.all([
      getMyTacticStats(user.id),
      getStreak(user.id),
      getReviewDueCount(),
      lessonsOn ? getNextLesson() : null,
      listTrails(),
      getMyTitleSummary(user.id),
    ]);

  return (
    <>
      <Heading name={user.name} />
      {params.senha === "alterada" && (
        <FormAlert tone="sucesso">Sua senha foi alterada.</FormAlert>
      )}
      {params.teste === "ativado" && (
        <FormAlert tone="sucesso">
          Seu teste grátis de 30 dias começou. Você tem acesso completo ao plano
          Membro: táticas, aberturas, finais, aulas, análise e lives. Bom
          treino!
        </FormAlert>
      )}

      <section
        aria-labelledby="titulo-atual"
        className="flex flex-col gap-3 rounded-card border border-border bg-surface p-6 shadow-card"
      >
        <h2 id="titulo-atual" className="text-lg font-semibold">
          Seu título
        </h2>
        <TitleProgressCard summary={titles} />
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal index={0} className="flex">
          <Card className="flex w-full flex-col gap-3">
            <span className="text-sm text-muted">Sequência</span>
            <span className="font-display text-4xl font-semibold tabular-nums">
              {streak.current} {streak.current === 1 ? "dia" : "dias"}
            </span>
            <StreakWeek days={streak.week} />
            <span className="text-sm text-muted">
              {streak.trainedToday
                ? "Hoje já conta."
                : "Treine hoje para manter a sequência."}{" "}
              Recorde: {streak.best}.
            </span>
          </Card>
        </Reveal>

        <Reveal index={1} className="flex">
          <Card className="flex w-full flex-col gap-3">
            <span className="text-sm text-muted">Rating de táticas</span>
            <span className="font-display text-4xl font-semibold tabular-nums">
              {stats.rating}
            </span>
            <span className="text-sm text-muted">
              {stats.solved} puzzles resolvidos · plano {plan}
            </span>
            <Link
              href="/taticas"
              className={buttonClasses("secondary", "md", "mt-auto self-start")}
            >
              Treinar táticas
            </Link>
          </Card>
        </Reveal>

        <Reveal index={2} className="flex">
          <Card
            className="flex w-full flex-col gap-3"
            highlight={reviewDue > 0}
          >
            <span className="text-sm text-muted">Revisão de hoje</span>
            <span className="font-display text-4xl font-semibold tabular-nums">
              {reviewDue}
            </span>
            <span className="text-sm text-muted">
              {reviewDue > 0
                ? "Puzzles que você errou voltando na hora certa."
                : "Nada para revisar agora."}
            </span>
            {reviewDue > 0 && (
              <Link
                href="/taticas?modo=revisao"
                className={buttonClasses("primary", "md", "mt-auto self-start")}
              >
                Revisar agora
              </Link>
            )}
          </Card>
        </Reveal>

        {lessonsOn && (
          <Reveal index={3} className="flex">
            <Card className="flex w-full flex-col gap-3">
              <span className="text-sm text-muted">Próxima aula</span>
              {nextLesson ? (
                <>
                  <span className="font-semibold">
                    {nextLesson.lessonTitle}
                  </span>
                  <span className="text-sm text-muted">
                    {nextLesson.courseTitle} · {nextLesson.done} de{" "}
                    {nextLesson.total}
                  </span>
                  <Link
                    href={`/aulas/${nextLesson.courseId}/${nextLesson.lessonId}`}
                    className={buttonClasses(
                      "secondary",
                      "md",
                      "mt-auto self-start",
                    )}
                  >
                    {nextLesson.done > 0 ? "Continuar" : "Começar"}
                  </Link>
                </>
              ) : (
                <span className="text-sm text-muted">
                  Nenhuma aula pendente por enquanto.
                </span>
              )}
            </Card>
          </Reveal>
        )}
      </div>

      {user.planRank >= 2 && (
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-accent bg-surface-2 p-6 shadow-card">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Método Padrão Finale</h2>
            <p className="text-[0.9375rem] text-muted">
              Seus conjuntos de táticas em ciclos de repetição, com cronômetro.
            </p>
          </div>
          <Link href="/treino" className={buttonClasses("primary")}>
            Abrir o treino
          </Link>
        </section>
      )}

      {trails.length > 0 && (
        <section aria-labelledby="trilhas" className="flex flex-col gap-4">
          <h2 id="trilhas" className="text-lg font-semibold">
            Trilhas
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {trails.map((trail) => (
              <li key={trail.id}>
                <Card className="flex h-full flex-col gap-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold">{trail.title}</h3>
                    <span className="text-sm text-muted tabular-nums">
                      {trail.progress.completed} de {trail.progress.total}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`Progresso da trilha ${trail.title}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={trail.progress.percent}
                    className="h-2 overflow-hidden rounded-full bg-surface-2"
                  >
                    <ProgressFill percent={trail.progress.percent} />
                  </div>
                  {trail.description && (
                    <p className="text-sm leading-relaxed text-muted">
                      {trail.description}
                    </p>
                  )}
                  {trail.progress.next && trail.nextHref ? (
                    <Link
                      href={trail.nextHref}
                      className={buttonClasses(
                        "secondary",
                        "md",
                        "mt-auto self-start",
                      )}
                    >
                      {STEP_LABELS[trail.progress.next.kind]}:{" "}
                      {trail.progress.next.title}
                    </Link>
                  ) : (
                    <span className="mt-auto text-sm font-semibold text-success">
                      Trilha concluída.
                    </span>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="areas" className="flex flex-col gap-4">
        <h2 id="areas" className="text-lg font-semibold">
          Áreas de treino
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {areas.map(({ href, label, Icon, hiddenForUsers }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-card transition hover:border-border-strong"
              >
                <span className="flex size-10 items-center justify-center rounded-control bg-surface-2 text-accent-text">
                  <Icon />
                </span>
                <span className="font-semibold">{label}</span>
                {hiddenForUsers && (
                  <span className="text-xs text-muted">
                    Oculta para usuários
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Heading({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Painel</SectionLabel>
      <h1 className="font-display text-page font-semibold tracking-tight">
        Olá, {name}
      </h1>
    </div>
  );
}
