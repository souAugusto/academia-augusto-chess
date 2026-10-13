import { STYLES, type ResultStyle } from "@/lib/style/styles";

// Selo do estilo de jogo (cor do estilo, texto curto).
export function StyleBadge({
  style,
  size = "md",
}: {
  style: ResultStyle;
  size?: "sm" | "md";
}) {
  const info = STYLES[style];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${info.badge} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span aria-hidden className={`size-2 rounded-full ${info.bar}`} />
      {info.name}
    </span>
  );
}
