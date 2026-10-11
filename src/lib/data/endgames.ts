import "server-only";
import type { Goal } from "@/lib/endgames";
import { createClient } from "@/lib/supabase/server";

// Finais clássicos. O RLS filtra pelo plano e por publicação.

export type Endgame = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  level: number;
  fen: string;
  userColor: "white" | "black";
  goal: Goal;
  maxMoves: number;
};

export type EndgameSummary = Endgame & { attempts: number; successes: number };

const SELECT =
  "id, slug, title, description, category, level, fen, user_color, goal, max_moves";

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  level: number;
  fen: string;
  user_color: string;
  goal: string;
  max_moves: number;
};

const toEndgame = (row: Row): Endgame => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  category: row.category,
  level: row.level,
  fen: row.fen,
  userColor: row.user_color as Endgame["userColor"],
  goal: row.goal as Goal,
  maxMoves: row.max_moves,
});

export async function listEndgames(): Promise<EndgameSummary[]> {
  const supabase = await createClient();
  const [{ data: rows }, { data: attempts }] = await Promise.all([
    supabase.from("endgames").select(SELECT).order("level").order("position"),
    supabase.from("endgame_attempts").select("endgame_id, success"),
  ]);
  return ((rows ?? []) as Row[]).map((row) => {
    const mine = (attempts ?? []).filter(
      (attempt) => attempt.endgame_id === row.id,
    );
    return {
      ...toEndgame(row),
      attempts: mine.length,
      successes: mine.filter((attempt) => attempt.success).length,
    };
  });
}

export async function getEndgame(slug: string): Promise<Endgame | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("endgames")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? toEndgame(data as Row) : null;
}

export const LEVEL_LABELS: Record<number, string> = {
  1: "Básico",
  2: "Intermediário",
  3: "Avançado",
};
