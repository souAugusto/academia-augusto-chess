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
import { botById } from "@/content/personagens";
import { gamePgn } from "@/lib/bot/history";
import { getBotGame } from "@/lib/data/bot-progress";
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
  // Partida contra o computador (?robo=<id>): abre já analisando.
  let robo: { pgn: string; color: "w" | "b"; label: string } | null = null;
  if (typeof params.robo === "string") {
    const game = await getBotGame(params.robo);
    const bot = game && game !== "login" ? botById(game.botId) : undefined;
    if (game && game !== "login" && bot && game.moves.length > 0)
      robo = {
        pgn: gamePgn(game, bot.nome, user.name),
        color: game.color,
        label: `${user.name} contra ${bot.nome} · ${formatDate(game.playedAt)}`,
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
          {robo
            ? `Partida contra o computador: ${robo.label}.`
            : imported
              ? `Partida importada: ${imported.label}.`
              : "Cole uma partida em PGN ou escolha uma das suas partidas importadas. A análise classifica cada lance, mostra a precisão de cada lado e os momentos-chave."}
        </p>
      </div>
      <AnalysisWorkbench
        key={
          robo
            ? `robo-${params.robo}`
            : imported
              ? `partida-${imported.id}`
              : "nova"
        }
        initial={
          robo
            ? { kind: "pgn", pgn: robo.pgn }
            : imported
              ? {
                  kind: "importada",
                  gameId: imported.id,
                  color: imported.color,
                }
              : { kind: "nova" }
        }
        lessons={lessonIndex()}
        completed={completed}
        userColor={robo?.color ?? imported?.color ?? null}
        canSaveTactic={user.planRank >= 2}
      />
      <section aria-labelledby="salvas" className="flex flex-col gap-3">
        <h2 id="salvas" className="text-lg font-semibold">
          Análises guardadas
        </h2>
        {saved.length === 0 ? (
          <p className="text-muted">
            Nenhuma análise guardada ainda. Toda análise concluída fica guardada
            aqui.{" "}
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
                    {item.accuracyWhite ?? "—"} / {item.accuracyBlack ?? "—"}
                    {item.outdated && " · padrão antigo, reanalise"}
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
