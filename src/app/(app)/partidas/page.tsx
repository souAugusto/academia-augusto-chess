import type { Metadata } from "next";
import Link from "next/link";
import { PlanRequired } from "@/components/app/PlanRequired";
import { GameStatsView } from "@/components/games/GameStatsView";
import { ImportButton } from "@/components/games/ImportButton";
import { LinkAccountForm } from "@/components/games/LinkAccountForm";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { buttonClasses } from "@/components/ui/button";
import { ANALYSIS_MIN_PLAN_RANK } from "@/lib/analysis/config";
import { analysedGameIds } from "@/lib/data/analyses";
import {
  getGamesForStats,
  getLinkedAccounts,
  getRecentGames,
} from "@/lib/data/games";
import { formatDate, formatLongDate } from "@/lib/format";
import { PLATFORM_LABELS, type Platform } from "@/lib/games/normalize";
import { computeStats } from "@/lib/games/stats";
import { unlinkAccount } from "./actions";

export const metadata: Metadata = { title: "Minhas partidas" };

// As actions da importação herdam este limite (o Lichess pode levar ~30s).
export const maxDuration = 120;

const PLATFORMS: Platform[] = ["chesscom", "lichess"];
const RESULT_LABELS = { win: "vitória", draw: "empate", loss: "derrota" };
const FILTERS = [
  { value: null, label: "Ambas" },
  { value: "chesscom", label: "Chess.com" },
  { value: "lichess", label: "Lichess" },
] as const;

export default async function PartidasPage({
  searchParams,
}: PageProps<"/partidas">) {
  const [user, params] = await Promise.all([
    requireUser("/partidas"),
    searchParams,
  ]);
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Minhas partidas"
        text="Importar suas partidas do Chess.com e do Lichess e ver suas estatísticas faz parte da assinatura."
      />
    );
  }

  const filter = PLATFORMS.find((item) => item === params.plataforma) ?? null;
  const canAnalyse = user.planRank >= ANALYSIS_MIN_PLAN_RANK;
  const [accounts, games, recent, analysed] = await Promise.all([
    getLinkedAccounts(),
    getGamesForStats(filter),
    getRecentGames(filter),
    canAnalyse ? analysedGameIds() : Promise.resolve(new Map<number, string>()),
  ]);
  const stats = computeStats(games);

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Treino</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Minhas partidas
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Importe suas partidas públicas do Chess.com e do Lichess e veja como
          você joga: resultados, aberturas, ritmos e rating. São só números das
          partidas, sem análise de motor.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const account = accounts.find((item) => item.platform === platform);
          return (
            <Card key={platform} className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">
                {PLATFORM_LABELS[platform]}
              </h2>
              {account ? (
                <>
                  <div className="flex flex-col gap-1 text-sm">
                    <span>
                      Conta:{" "}
                      <span className="font-semibold">{account.username}</span>
                    </span>
                    <span className="text-muted">
                      {account.games} partidas salvas
                      {account.lastImportAt &&
                        ` · última atualização em ${formatLongDate(account.lastImportAt)}`}
                    </span>
                  </div>
                  <ImportButton
                    platform={platform}
                    firstTime={!account.lastImportAt}
                  />
                  <form action={unlinkAccount}>
                    <input type="hidden" name="platform" value={platform} />
                    <button
                      type="submit"
                      className="text-sm text-muted underline-offset-4 hover:text-text hover:underline"
                    >
                      Desvincular (apaga as partidas importadas desta conta)
                    </button>
                  </form>
                </>
              ) : (
                <LinkAccountForm platform={platform} />
              )}
            </Card>
          );
        })}
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="estatisticas">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="estatisticas" className="text-lg font-semibold">
            Estatísticas
          </h2>
          <nav
            aria-label="Filtrar por plataforma"
            className="flex gap-1 rounded-control bg-surface-2 p-1"
          >
            {FILTERS.map((item) => {
              const active = item.value === filter;
              return (
                <Link
                  key={item.label}
                  href={
                    item.value
                      ? `/partidas?plataforma=${item.value}`
                      : "/partidas"
                  }
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-touch items-center rounded-[0.6rem] px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-accent text-on-accent"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {games.length === 0 ? (
          <Card>
            <p className="text-muted">
              {accounts.length === 0
                ? "Vincule sua conta do Chess.com ou do Lichess e importe suas partidas para ver as estatísticas."
                : "Nenhuma partida importada ainda. Use o botão de importar acima."}
            </p>
          </Card>
        ) : (
          <GameStatsView stats={stats} />
        )}
      </section>
      {recent.length > 0 && (
        <section aria-labelledby="recentes" className="flex flex-col gap-3">
          <h2 id="recentes" className="text-lg font-semibold">
            Partidas recentes
          </h2>
          <ul className="flex flex-col gap-2">
            {recent.map((game) => {
              const analysisId = analysed.get(game.id);
              return (
                <li
                  key={game.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold">
                      {game.openingName ?? "Abertura não identificada"}
                    </span>
                    <span className="text-sm text-muted">
                      {formatDate(game.playedAt)} ·{" "}
                      {PLATFORM_LABELS[game.platform]} · de{" "}
                      {game.color === "white" ? "brancas" : "pretas"} ·{" "}
                      {RESULT_LABELS[game.result]}
                      {game.opponentRating
                        ? ` · adversário ${game.opponentRating}`
                        : ""}
                    </span>
                  </div>
                  {canAnalyse &&
                    (analysisId ? (
                      <Link
                        href={`/analise/${analysisId}`}
                        className={buttonClasses("secondary")}
                      >
                        Ver análise
                      </Link>
                    ) : (
                      <Link
                        href={`/analise?partida=${game.id}`}
                        className={buttonClasses("outline-accent")}
                      >
                        Analisar esta partida
                      </Link>
                    ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}
