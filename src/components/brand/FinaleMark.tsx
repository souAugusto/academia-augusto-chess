// Símbolo da Finale: castelo em contorno com o portão dourado.
// As cores vêm do tema (--logo-stroke e --logo-gate em globals.css), então o
// logo troca junto com o tema, sem piscar. Arquivos soltos em public/brand/.
type FinaleMarkProps = { className?: string; title?: string };

export function FinaleMark({ className, title }: FinaleMarkProps) {
  return (
    <svg
      viewBox="20 14 80 98"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      <path
        d="M30 20H44V34H53V20H67V34H76V20H90V46H82V96H94V106H26V96H38V46H30Z"
        fill="none"
        stroke="var(--logo-stroke)"
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <path
        d="M50 96V78A10 10 0 0 1 70 78V96"
        fill="none"
        stroke="var(--logo-gate)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
