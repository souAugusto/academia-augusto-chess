import { CLASS_LABELS, type MoveClass } from "@/lib/analysis/classify";

// Ícones próprios da Finale para as classes dos lances: círculo colorido com um
// símbolo branco. Símbolo + nome acessível: a classe nunca depende só da cor.
export const CLASS_COLOR: Record<MoveClass, string> = {
  brilhante: "var(--color-cls-brilhante)",
  otimo: "var(--color-cls-otimo)",
  melhor: "var(--color-cls-melhor)",
  excelente: "var(--color-cls-excelente)",
  bom: "var(--color-cls-bom)",
  teoria: "var(--color-cls-teoria)",
  imprecisao: "var(--color-cls-imprecisao)",
  erro: "var(--color-cls-erro)",
  chance_perdida: "var(--color-cls-chance-perdida)",
  erro_grave: "var(--color-cls-erro-grave)",
};

// Símbolo em texto (para listas compactas e leitores de tela).
export const CLASS_SYMBOL: Record<MoveClass, string> = {
  brilhante: "!!",
  otimo: "!",
  melhor: "★",
  excelente: "+",
  bom: "✓",
  teoria: "📖",
  imprecisao: "?!",
  erro: "?",
  chance_perdida: "×",
  erro_grave: "??",
};

function Glyph({ cls }: { cls: MoveClass }) {
  const text = (value: string, size = 11) => (
    <text
      x="12"
      y="12.5"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={size}
      fontWeight={800}
      fontFamily="system-ui, sans-serif"
      fill="#fff"
    >
      {value}
    </text>
  );
  const stroke = {
    fill: "none",
    stroke: "#fff",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (cls) {
    case "brilhante":
      return text("!!", 10);
    case "otimo":
      return text("!", 12);
    case "imprecisao":
      return text("?!", 10);
    case "erro":
      return text("?", 12);
    case "erro_grave":
      return text("??", 10);
    case "melhor":
      return (
        <path
          d="M12 5.2l1.95 4 4.4.6-3.2 3.05.78 4.35L12 15.1l-3.93 2.1.78-4.35-3.2-3.05 4.4-.6z"
          fill="#fff"
        />
      );
    case "excelente":
      return <path d="M12 7v10M7 12h10" {...stroke} />;
    case "bom":
      return <path d="M7.5 12.5l3 3 6-6.5" {...stroke} />;
    case "chance_perdida":
      return <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" {...stroke} />;
    case "teoria":
      return (
        <path
          d="M12 8.2c-1.6-1-3.6-1.3-5.5-1v8.6c1.9-.3 3.9 0 5.5 1 1.6-1 3.6-1.3 5.5-1V7.2c-1.9-.3-3.9 0-5.5 1zm0 0v8.6"
          fill="none"
          stroke="#fff"
          strokeWidth={1.7}
          strokeLinejoin="round"
        />
      );
  }
}

export function MoveClassIcon({
  cls,
  size = 20,
  decorative = false,
}: {
  cls: MoveClass;
  size?: number;
  decorative?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="shrink-0"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : CLASS_LABELS[cls]}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <circle cx="12" cy="12" r="11" fill={CLASS_COLOR[cls]} />
      <circle
        cx="12"
        cy="12"
        r="11"
        fill="none"
        stroke="rgb(255 255 255 / 0.85)"
        strokeWidth={1}
      />
      <Glyph cls={cls} />
    </svg>
  );
}
