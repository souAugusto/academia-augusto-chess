// Selo do título do aluno. A cor vem da escada de títulos (editável no admin).
export function TitleBadge({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "gap-1.5 px-2 py-0.5 text-xs",
    md: "gap-2 px-3 py-1 text-sm",
    lg: "gap-2.5 px-4 py-1.5 text-base",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold whitespace-nowrap ${sizes[size]}`}
      style={{ borderColor: color, color }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={size === "lg" ? "size-5" : "size-4"}
        fill="currentColor"
      >
        {/* Escudo com estrela: o selo de título da Finale. */}
        <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 5 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5L12 7Z" />
      </svg>
      {name}
    </span>
  );
}
