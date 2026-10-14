import type { Metadata } from "next";
import Link from "next/link";
import { EndgameLessonList } from "@/components/study/LessonLists";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getStudyProgress } from "@/lib/data/lessons";

export const metadata: Metadata = { title: "Lições de finais" };

export default async function LicoesFinaisPage() {
  const user = await requireUser("/licoes/finais");
  const progress = await getStudyProgress(user.id);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/licoes" className="text-sm text-muted hover:text-text">
          ← Lições
        </Link>
        <SectionLabel>Estudo</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Lições de finais
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Do básico ao avançado: teoria curta, uma posição-modelo explicada e
          posições para praticar em níveis crescentes. Para jogar finais contra
          o motor, use também{" "}
          <Link
            href="/finais"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            o treino de finais
          </Link>
          .
        </p>
      </div>
      <EndgameLessonList progress={progress} />
    </>
  );
}
