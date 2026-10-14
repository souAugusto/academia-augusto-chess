import type { MoveClass } from "@/lib/analysis/review";

// Símbolo e cor de cada classificação. Definidos uma vez, com os tokens do tema.
export const CLASS_STYLE: Record<
  MoveClass,
  { symbol: string; text: string; dot: string }
> = {
  melhor: { symbol: "★", text: "text-accent-text", dot: "bg-accent" },
  excelente: { symbol: "!", text: "text-success", dot: "bg-success" },
  bom: { symbol: "✓", text: "text-muted", dot: "bg-muted" },
  imprecisao: { symbol: "?!", text: "text-accent-2-text", dot: "bg-accent-2" },
  erro: { symbol: "?", text: "text-danger", dot: "bg-danger/70" },
  gafe: { symbol: "??", text: "text-danger", dot: "bg-danger" },
};
