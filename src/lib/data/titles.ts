import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyTacticStats } from "@/lib/data/tactics";
import { createClient } from "@/lib/supabase/server";
import {
  currentTitle,
  eligibleTitles,
  titleProgress,
  type Title,
  type TitleProgress,
} from "@/lib/titles";

type Row = {
  id: number;
  slug: string;
  name: string;
  min_rating: number;
  tagline: string | null;
  color: string;
};

const toTitle = (row: Row): Title => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  minRating: row.min_rating,
  tagline: row.tagline,
  color: row.color,
});

const COLUMNS = "id, slug, name, min_rating, tagline, color";

// Escada de títulos, do menor para o maior.
export async function getLadder(): Promise<Title[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("titles")
    .select(COLUMNS)
    .order("min_rating");
  return ((data ?? []) as Row[]).map(toTitle);
}

// Títulos já conquistados pelo aluno (ids).
export async function getMyTitleIds(userId: string): Promise<Set<number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_titles")
    .select("title_id")
    .eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.title_id as number));
}

// Concede os títulos que o rating atual alcançou e devolve só os NOVOS (para a
// celebração aparecer uma única vez por título). Só o servidor chama isto.
export async function awardTitles(
  userId: string,
  rating: number,
  games: number,
): Promise<Title[]> {
  const admin = createAdminClient();
  const { data: rows } = await admin
    .from("titles")
    .select(COLUMNS)
    .order("min_rating");
  const ladder = ((rows ?? []) as Row[]).map(toTitle);
  const eligible = eligibleTitles(ladder, rating, games);
  if (eligible.length === 0) return [];
  // "on conflict do nothing": títulos já conquistados não voltam na resposta.
  const { data: inserted, error } = await admin
    .from("user_titles")
    .upsert(
      eligible.map((title) => ({ user_id: userId, title_id: title.id })),
      { onConflict: "user_id,title_id", ignoreDuplicates: true },
    )
    .select("title_id");
  if (error) {
    console.error("Falha ao conceder títulos", error);
    return [];
  }
  const fresh = new Set((inserted ?? []).map((row) => row.title_id as number));
  return eligible.filter((title) => fresh.has(title.id));
}

export type TitleSummary = {
  ladder: Title[];
  earned: Map<number, Date>; // título -> quando conquistou
  current: Title | null;
  rating: number;
  games: number;
  progress: TitleProgress;
};

// Tudo o que as telas de títulos precisam, para o aluno logado.
export async function getMyTitleSummary(userId: string): Promise<TitleSummary> {
  const supabase = await createClient();
  const [ladder, { data: earnedRows }, stats] = await Promise.all([
    getLadder(),
    supabase
      .from("user_titles")
      .select("title_id, earned_at")
      .eq("user_id", userId),
    getMyTacticStats(userId),
  ]);
  const earned = new Map(
    (earnedRows ?? []).map((row) => [
      row.title_id as number,
      new Date(row.earned_at as string),
    ]),
  );
  const current = currentTitle(ladder, new Set(earned.keys()));
  return {
    ladder,
    earned,
    current,
    rating: stats.rating,
    games: stats.games,
    progress: titleProgress(ladder, stats.rating, stats.games, current),
  };
}

export type RankingRow = {
  pos: number;
  nickname: string;
  avatarPath: string | null;
  rating: number;
  games: number;
  titleName: string | null;
  titleColor: string | null;
  isMe: boolean;
};

// Ranking (a função do banco já filtra quem aparece e confere o plano).
export async function getRanking(limit = 50): Promise<RankingRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_ranking", {
    p_limit: limit,
  });
  if (error) {
    console.error("Ranking:", error);
    return [];
  }
  type Row = {
    pos: number;
    display_name: string;
    avatar_path: string | null;
    rating: number;
    games: number;
    title_name: string | null;
    title_color: string | null;
    is_me: boolean;
  };
  return ((data ?? []) as Row[]).map((row) => ({
    pos: Number(row.pos),
    nickname: row.display_name,
    avatarPath: row.avatar_path,
    rating: row.rating,
    games: row.games,
    titleName: row.title_name,
    titleColor: row.title_color,
    isMe: row.is_me,
  }));
}
