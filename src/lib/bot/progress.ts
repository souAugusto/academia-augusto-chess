import type { Result } from "./game";

// Progresso na trilha de personagens (lógica pura, testável). O mesmo formato
// vale para o visitante (no aparelho) e para quem tem conta (no banco).

export type BotRecord = {
  vitorias: number;
  derrotas: number;
  empates: number;
  estrelas: number; // melhor número de estrelas (0 a 3)
};

export type Progress = Record<string, BotRecord>; // por id do personagem

export const STORAGE_PROGRESS = "finale:jogar:progresso";
export const MAX_GAMES = 100_000; // teto de cada contador (validação)

export const EMPTY_RECORD: BotRecord = { vitorias: 0, derrotas: 0, empates: 0, estrelas: 0 };

export type BotStatus = "bloqueado" | "disponivel" | "vencido";

// O nível 1 começa liberado; os outros, depois de vencer o anterior.
export function botStatus(order: string[], progress: Progress, id: string): BotStatus {
  const index = order.indexOf(id);
  if (index < 0) return "bloqueado";
  if ((progress[id]?.vitorias ?? 0) > 0) return "vencido";
  if (index === 0) return "disponivel";
  return (progress[order[index - 1]]?.vitorias ?? 0) > 0 ? "disponivel" : "bloqueado";
}

// Melhor resultado já alcançado contra um personagem.
export function bestResult(record: BotRecord | undefined): Result | null {
  if (!record) return null;
  if (record.vitorias > 0) return "vitoria";
  if (record.empates > 0) return "empate";
  if (record.derrotas > 0) return "derrota";
  return null;
}

export function recordGame(
  progress: Progress,
  id: string,
  result: Result,
  stars: number,
): Progress {
  const current = progress[id] ?? EMPTY_RECORD;
  return {
    ...progress,
    [id]: {
      vitorias: current.vitorias + (result === "vitoria" ? 1 : 0),
      derrotas: current.derrotas + (result === "derrota" ? 1 : 0),
      empates: current.empates + (result === "empate" ? 1 : 0),
      estrelas: Math.max(current.estrelas, Math.min(3, Math.max(0, stars))),
    },
  };
}

// Junta o progresso do aparelho com o da conta: fica o maior de cada número
// (juntar duas vezes não duplica nada).
export function mergeProgress(a: Progress, b: Progress): Progress {
  const merged: Progress = { ...a };
  for (const [id, record] of Object.entries(b)) {
    const current = merged[id] ?? EMPTY_RECORD;
    merged[id] = {
      vitorias: Math.max(current.vitorias, record.vitorias),
      derrotas: Math.max(current.derrotas, record.derrotas),
      empates: Math.max(current.empates, record.empates),
      estrelas: Math.max(current.estrelas, record.estrelas),
    };
  }
  return merged;
}

// Lê o progresso guardado, descartando o que não tiver o formato certo.
export function parseProgress(raw: unknown, validIds: string[]): Progress {
  if (!raw || typeof raw !== "object") return {};
  const result: Progress = {};
  const count = (value: unknown) =>
    typeof value === "number" && Number.isInteger(value) && value >= 0
      ? Math.min(value, MAX_GAMES)
      : 0;
  for (const id of validIds) {
    const record = (raw as Record<string, unknown>)[id];
    if (!record || typeof record !== "object") continue;
    const r = record as Record<string, unknown>;
    result[id] = {
      vitorias: count(r.vitorias),
      derrotas: count(r.derrotas),
      empates: count(r.empates),
      estrelas: Math.min(3, count(r.estrelas)),
    };
  }
  return result;
}

export function totalStars(progress: Progress): number {
  return Object.values(progress).reduce((sum, r) => sum + r.estrelas, 0);
}

// Conquistas simples, calculadas a partir do progresso (não ficam guardadas).
export type Achievement = { id: string; title: string; text: string };

export function achievements(order: string[], progress: Progress): Achievement[] {
  const list: Achievement[] = [];
  const games = Object.values(progress).reduce(
    (sum, r) => sum + r.vitorias + r.derrotas + r.empates,
    0,
  );
  const wins = order.filter((id) => (progress[id]?.vitorias ?? 0) > 0).length;
  const stars = totalStars(progress);
  const last = order[order.length - 1];
  if (games >= 1)
    list.push({ id: "primeira-partida", title: "Primeira partida", text: "Jogou a primeira partida da trilha." });
  if (wins >= 1)
    list.push({ id: "primeira-vitoria", title: "Primeira vitória", text: "Venceu o primeiro personagem." });
  if (wins >= Math.ceil(order.length / 2))
    list.push({ id: "meio-caminho", title: "Meio do caminho", text: "Venceu metade dos personagens." });
  if (order.some((id) => (progress[id]?.estrelas ?? 0) === 3))
    list.push({ id: "tres-estrelas", title: "Sem ajuda", text: "Venceu um personagem com 3 estrelas." });
  if (games >= 25)
    list.push({ id: "persistente", title: "Persistente", text: "Jogou 25 partidas na trilha." });
  if (stars >= order.length * 3)
    list.push({ id: "colecionador", title: "Colecionador", text: "Conquistou todas as estrelas." });
  if ((progress[last]?.empates ?? 0) > 0 || (progress[last]?.vitorias ?? 0) > 0)
    list.push({ id: "diante-do-rei", title: "Diante do rei", text: "Empatou ou venceu o chefe da trilha." });
  if ((progress[last]?.vitorias ?? 0) > 0)
    list.push({ id: "coroa", title: "A coroa", text: "Venceu o chefe da trilha." });
  return list;
}

// Conquistas que apareceram com a última partida.
export function newAchievements(
  order: string[],
  before: Progress,
  after: Progress,
): Achievement[] {
  const had = new Set(achievements(order, before).map((a) => a.id));
  return achievements(order, after).filter((a) => !had.has(a.id));
}
