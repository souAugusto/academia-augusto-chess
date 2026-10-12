// Últimos 7 dias: bolinha cheia = treinou naquele dia.
const WEEKDAY = new Intl.DateTimeFormat("pt-BR", {
  weekday: "narrow",
  timeZone: "UTC",
});

export function StreakWeek({
  days,
}: {
  days: { day: string; trained: boolean }[];
}) {
  return (
    <ol className="flex gap-1.5" aria-label="Treino nos últimos 7 dias">
      {days.map(({ day, trained }) => (
        <li key={day} className="flex flex-col items-center gap-1">
          <span
            className={`size-6 rounded-full border ${
              trained
                ? "border-accent bg-accent"
                : "border-border-strong bg-transparent"
            }`}
            title={trained ? `${day}: treinou` : `${day}: sem treino`}
          />
          <span className="text-[0.6875rem] text-muted uppercase" aria-hidden>
            {WEEKDAY.format(new Date(`${day}T12:00:00Z`))}
          </span>
          <span className="sr-only">
            {day}: {trained ? "treinou" : "sem treino"}
          </span>
        </li>
      ))}
    </ol>
  );
}
