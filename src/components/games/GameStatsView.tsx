import { Card } from "@/components/ui/Card";
import { END_REASON_LABELS, TIME_CLASS_LABELS } from "@/lib/games/normalize";
import type { GameStats, OpeningStat, Record3 } from "@/lib/games/stats";
import { RatingChart } from "./RatingChart";

// Barra de vitórias, empates e derrotas.
function RecordBar({ record }: { record: Record3 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-surface-2"
        aria-hidden
      >
        <div className="bg-success" style={{ width: `${record.winRate}%` }} />
        <div className="bg-muted" style={{ width: `${record.drawRate}%` }} />
        <div className="bg-danger" style={{ width: `${record.lossRate}%` }} />
      </div>
      <p className="text-sm text-muted tabular-nums">
        <span className="text-success">{record.winRate}% vitórias</span> ·{" "}
        {record.drawRate}% empates ·{" "}
        <span className="text-danger">{record.lossRate}% derrotas</span>
      </p>
    </div>
  );
}

function OpeningList({
  title,
  openings,
}: {
  title: string;
  openings: OpeningStat[];
}) {
  return (
    <Card className="flex flex-col gap-3">
      <h3 className="font-semibold">{title}</h3>
      {openings.length === 0 ? (
        <p className="text-sm text-muted">Sem partidas com essa cor.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {openings.map((opening) => (
            <li key={opening.name} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-semibold">
                  {opening.name}
                  {opening.eco && (
                    <span className="ml-1.5 font-normal text-muted">
                      {opening.eco}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-muted tabular-nums">
                  {opening.games} · {opening.winRate}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-success"
                  style={{ width: `${opening.winRate}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function GameStatsView({ stats }: { stats: GameStats }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-3">
          <span className="text-sm text-muted">Partidas</span>
          <span className="font-display text-4xl font-semibold tabular-nums">
            {stats.overall.games}
          </span>
          <RecordBar record={stats.overall} />
        </Card>
        <Card className="flex flex-col gap-3">
          <span className="text-sm text-muted">De brancas</span>
          <span className="font-display text-4xl font-semibold tabular-nums">
            {stats.byColor.white.games}
          </span>
          <RecordBar record={stats.byColor.white} />
        </Card>
        <Card className="flex flex-col gap-3">
          <span className="text-sm text-muted">De pretas</span>
          <span className="font-display text-4xl font-semibold tabular-nums">
            {stats.byColor.black.games}
          </span>
          <RecordBar record={stats.byColor.black} />
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Evolução do rating</h2>
        <RatingChart series={stats.ratings} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Por ritmo de jogo</h2>
          <ul className="flex flex-col gap-4">
            {stats.byTimeClass.map(({ timeClass, record }) => (
              <li key={timeClass} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">
                    {TIME_CLASS_LABELS[timeClass]}
                  </span>
                  <span className="text-muted tabular-nums">
                    {record.games} {record.games === 1 ? "partida" : "partidas"}
                  </span>
                </div>
                <RecordBar record={record} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Como as partidas terminam</h2>
          <ul className="flex flex-col gap-2">
            {stats.endings.map((ending) => (
              <li
                key={ending.reason}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>{END_REASON_LABELS[ending.reason]}</span>
                <span className="text-muted tabular-nums">
                  {ending.count} ({ending.percent}%)
                </span>
              </li>
            ))}
          </ul>
          {stats.averageMoves !== null && (
            <p className="border-t border-border pt-3 text-sm text-muted">
              Duração média:{" "}
              <span className="font-semibold text-text">
                {stats.averageMoves} lances
              </span>
            </p>
          )}
        </Card>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="aberturas">
        <h2 id="aberturas" className="text-lg font-semibold">
          Aberturas mais jogadas
        </h2>
        <p className="text-sm text-muted">
          Número de partidas e porcentagem de vitórias em cada uma.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <OpeningList title="De brancas" openings={stats.openings.white} />
          <OpeningList title="De pretas" openings={stats.openings.black} />
        </div>
      </section>
    </div>
  );
}
