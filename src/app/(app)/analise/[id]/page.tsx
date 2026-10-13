import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalysisWorkbench } from "@/components/analysis/AnalysisWorkbench";
import { PlanRequired } from "@/components/app/PlanRequired";
import { SectionLabel } from "@/components/ui/Label";
import { ANALYSIS_MIN_PLAN_RANK } from "@/lib/analysis/config";
import { requireUser } from "@/lib/data/account";
import { getAnalysis } from "@/lib/data/analyses";
import { getStudyProgress } from "@/lib/data/lessons";
import { lessonIndex } from "@/lib/data/lesson-index";
import { createClient } from "@/lib/supabase/server";
import { analysisUpgradeText } from "../gate";

export const metadata: Metadata = { title: "Análise salva" };

export default async function AnaliseSalvaPage({
  params,
}: PageProps<"/analise/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/analise/${id}`);
  if (user.planRank < ANALYSIS_MIN_PLAN_RANK)
    return (
      <PlanRequired
        title="Análise de partidas"
        text={analysisUpgradeText(user.planRank)}
      />
    );
  const analysis = await getAnalysis(id);
  if (!analysis) notFound();

  // Partida importada: o tabuleiro fica do lado do aluno.
  let orientation: "w" | "b" = "w";
  if (analysis.importedGameId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("imported_games")
      .select("color")
      .eq("id", analysis.importedGameId)
      .maybeSingle();
    if (data?.color === "black") orientation = "b";
  }

  const progress = await getStudyProgress();
  const completed = [...progress]
    .filter(([, item]) => item.completed)
    .map(([slug]) => slug);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/analise" className="text-sm text-muted hover:text-text">
          ← Análise de partidas
        </Link>
        <SectionLabel>Análise salva</SectionLabel>
      </div>
      <AnalysisWorkbench
        initial={{
          kind: "salva",
          id: analysis.id,
          title: analysis.title,
          headers: analysis.headers,
          data: analysis.data,
          orientation,
        }}
        lessons={lessonIndex()}
        completed={completed}
        userColor={analysis.importedGameId ? orientation : null}
      />
    </>
  );
}
