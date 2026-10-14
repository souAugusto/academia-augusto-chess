import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import {
  contentCounts,
  ENDGAME_LESSONS,
  OPENING_LESSONS,
} from "@/content/licoes";
import { requireUser } from "@/lib/data/account";
import { getStudyProgress } from "@/lib/data/lessons";

export const metadata: Metadata = { title: "Lições" };

export default async function LicoesPage() {
  const user = await requireUser("/licoes");
  const progress = await getStudyProgress(user.id);
  const counts = contentCounts();
  const done = (slugs: string[]) =>
    slugs.filter((slug) => progress.get(slug)?.completed).length;

  const areas = [
    {
      href: "/licoes/aberturas",
      title: "Aberturas",
      text: "Ideias, planos, armadilhas e a linha principal lance a lance, com prática em três níveis e quiz.",
      detail: `${counts.openingLessons} lições · ${counts.openingDrills} exercícios`,
      completed: done(OPENING_LESSONS.map((lesson) => lesson.slug)),
      total: counts.openingLessons,
    },
    {
      href: "/licoes/finais",
      title: "Finais",
      text: "Do mate básico aos finais de torre: teoria curta, posição-modelo e posições para treinar.",
      detail: `${counts.endgameLessons} lições · ${counts.endgamePositions} posições`,
      completed: done(ENDGAME_LESSONS.map((lesson) => lesson.slug)),
      total: counts.endgameLessons,
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Estudo</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Lições
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Aulas curtas para ler, ver no tabuleiro e praticar. Cada lição termina
          com exercícios e um quiz, e o seu progresso fica salvo.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {areas.map((area) => (
          <Card key={area.href} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{area.title}</h2>
            <p className="leading-relaxed text-muted">{area.text}</p>
            <p className="text-sm text-muted">
              {area.detail} · {area.completed} de {area.total} concluídas
            </p>
            <Link
              href={area.href}
              className={buttonClasses("primary", "md", "mt-auto self-start")}
            >
              Ver lições de {area.title.toLowerCase()}
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
