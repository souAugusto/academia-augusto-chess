import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisWorkbench } from "@/components/analysis/AnalysisWorkbench";
import { PlanRequired } from "@/components/app/PlanRequired";
import { SectionLabel } from "@/components/ui/Label";
import { ANALYSIS_MIN_PLAN_RANK } from "@/lib/analysis/config";
import { requireUser } from "@/lib/data/account";
import { listAnalyses } from "@/lib/data/analyses";
import { formatDate } from "@/lib/format";
import { getStudyProgress } from "@/lib/data/lessons";
import { lessonIndex } from "@/lib/data/lesson-index";
import { createClient } from "@/lib/supabase/server";
import { analysisUpgradeText } from "./gate";

export const metadata: Metadata = { title: "Análise de partidas" };

export default async function AnalisePage({
  searchParams,
}: PageProps<"/analise">) {
  const params = await searchParams;
  const partida = Number(
    typeof params.partida === "string" ? params.partida : NaN,
  );
  const user = await requireUser("/analise");
  if (user.planRank < ANALYSIS_MIN_PLAN_RANK)
    return (
      <PlanRequired
        title="Análise de partidas"
        text={analysisUpgradeText(user.planRank)}
      />
    );

  let imported: { id: number; color: "w" | "b"; label: string } | null = null;
  if (Number.isSafeInteger(partida) && partida > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("imported_games")
      .select("id, color, opening_name, played_at")
      .eq("id", partida)
      .maybeSingle();
    if (data)
      imported = {
        id: data.id,
        color: data.color === "black" ? "b" : "w",
        label: `${data.opening_name ?? "Partida"} · ${formatDate(data.played_at)}`,
      };
  }
  const [saved, progress] = await Promise.all([
    listAnalyses(user.id, 20),
    getStudyProgress(user.id),
  ]);
  const completed = [...progress]
    .filter(([, item]) => item.completed)
    .map(([slug]) => slug);

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Treino</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Análise de partidas
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          {imported
            ? `Partida importada: ${imported.label}.`
            : "Cole uma partida em PGN ou escolha uma das suas partidas importadas. O motor mostra os erros, os momentos críticos e o melhor lance em cada posição."}
        </p>
      </div>
      <AnalysisWorkbench
        key={imported ? `partida-${imported.id}` : "nova"}
        initial={
          imported
            ? { kind: "importada", gameId: imported.id, color: imported.color }
            : { kind: "nova" }
        }
        lessons={lessonIndex()}
        completed={completed}
        userColor={imported?.color ?? null}
      />
      <section aria-labelledby="salvas" className="flex flex-col gap-3">
        <h2 id="salvas" className="text-lg font-semibold">
          Análises salvas
        </h2>
        {saved.length === 0 ? (
          <p className="text-muted">
            Nenhuma análise salva ainda.{" "}
            <Link
              href="/partidas"
              className="text-accent-text underline-offset-4 hover:underline"
            >
              Ver minhas partidas importadas
            </Link>
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {saved.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/analise/${item.id}`}
                  className="flex flex-col gap-1 rounded-card border border-border bg-surface p-4 transition hover:border-border-strong"
                >
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-sm text-muted">
                    {formatDate(item.createdAt)} · precisão{" "}
                    {item.accuracyWhite ?? "—"} / {item.accuracyBlack ?? "—"} ·
                    profundidade {item.depth}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
