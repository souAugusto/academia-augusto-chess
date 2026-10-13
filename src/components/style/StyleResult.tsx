import {
  STYLE_IDS,
  STYLES,
  type ResultStyle,
  type StyleId,
} from "@/lib/style/styles";
import { StyleBadge } from "./StyleBadge";

// Resultado do questionário: estilo, descrição e a parte de cada estilo.
export function StyleResult({
  style,
  percents,
}: {
  style: ResultStyle;
  percents: Record<StyleId, number>;
}) {
  const info = STYLES[style];
  const ordered = [...STYLE_IDS].sort((a, b) => percents[b] - percents[a]);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-muted">Seu estilo de jogo</span>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-section font-semibold tracking-tight">
            {info.name}
          </h2>
          <StyleBadge style={style} />
        </div>
        <p className="max-w-2xl leading-relaxed text-muted">
          {info.description}
        </p>
      </div>

      <ul className="flex flex-col gap-2.5" aria-label="Pontuação por estilo">
        {ordered.map((id) => (
          <li key={id} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{STYLES[id].name}</span>
              <span className="text-muted tabular-nums">{percents[id]}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${STYLES[id].bar}`}
                style={{ width: `${percents[id]}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-control bg-surface-2 p-4">
          <h3 className="text-sm font-semibold text-success">Pontos fortes</h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
            {info.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 rounded-control bg-surface-2 p-4">
          <h3 className="text-sm font-semibold text-accent-text">
            Pontos a desenvolver
          </h3>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
            {info.toDevelop.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
