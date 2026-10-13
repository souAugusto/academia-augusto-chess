import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanRequired } from "@/components/app/PlanRequired";
import { LessonView } from "@/components/study/LessonView";
import { SectionLabel } from "@/components/ui/Label";
import { findLesson } from "@/content/licoes";
import { DIFFICULTY_LABELS, GROUP_LABELS } from "@/content/licoes/types";
import { requireUser } from "@/lib/data/account";
import { getMyStyle, getStudyProgress } from "@/lib/data/lessons";

export async function generateMetadata({
  params,
}: PageProps<"/licoes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: findLesson(slug)?.title ?? "Lição" };
}

export default async function LicaoPage({
  params,
}: PageProps<"/licoes/[slug]">) {
  const { slug } = await params;
  const user = await requireUser(`/licoes/${slug}`);
  const lesson = findLesson(slug);
  if (!lesson) notFound();
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title={lesson.title}
        text="As lições de aberturas e de finais, com prática e quiz, fazem parte da assinatura."
      />
    );
  }
  const [progress, myStyle] = await Promise.all([
    getStudyProgress(),
    getMyStyle(user.id),
  ]);
  const mine = progress.get(lesson.slug);
  const back =
    lesson.kind === "abertura"
      ? { href: "/licoes/aberturas", label: "Lições de aberturas" }
      : { href: "/licoes/finais", label: "Lições de finais" };

  return (
    <LessonView
      lesson={lesson}
      myStyle={myStyle}
      initialSolved={mine?.practiceSolved ?? 0}
      initialCompleted={mine?.completed ?? false}
      header={
        <div className="flex flex-col gap-1">
          <Link href={back.href} className="text-sm text-muted hover:text-text">
            ← {back.label}
          </Link>
          <SectionLabel>
            {lesson.kind === "abertura"
              ? `${lesson.eco} · com as ${lesson.side}`
              : GROUP_LABELS[lesson.group]}{" "}
            · {DIFFICULTY_LABELS[lesson.difficulty]}
          </SectionLabel>
          <h1 className="font-display text-page font-semibold tracking-tight">
            {lesson.title}
          </h1>
        </div>
      }
    />
  );
}
