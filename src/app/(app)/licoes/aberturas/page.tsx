import type { Metadata } from "next";
import Link from "next/link";
import { OpeningLessonList } from "@/components/study/LessonLists";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getStudyProgress } from "@/lib/data/lessons";

export const metadata: Metadata = { title: "Lições de aberturas" };

export default async function LicoesAberturasPage() {
  const user = await requireUser("/licoes/aberturas");
  const progress = await getStudyProgress(user.id);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/licoes" className="text-sm text-muted hover:text-text">
          ← Lições
        </Link>
        <SectionLabel>Estudo</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Lições de aberturas
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Cada lição mostra as ideias da abertura, a linha principal explicada
          lance a lance, as armadilhas mais comuns, exercícios em três níveis e
          um quiz. Para treinar um repertório completo, use também{" "}
          <Link
            href="/aberturas"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            os repertórios
          </Link>
          .
        </p>
      </div>
      <OpeningLessonList progress={progress} />
    </>
  );
}
