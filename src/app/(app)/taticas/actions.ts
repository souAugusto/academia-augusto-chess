"use server";

import { z } from "zod";
import { evaluateAttempt } from "@/lib/chess/solver";
import { isThemeFilter } from "@/lib/chess/themes";
import { checkPlan } from "@/lib/data/access";
import {
  getMyTacticStats,
  toTacticPuzzle,
  type TacticPuzzle,
} from "@/lib/data/tactics";
import { difficultyRange, nextRating, type Difficulty } from "@/lib/rating";
import { median, nextReview } from "@/lib/srs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Failure = { ok: false; error: string };

const ACCESS_ERRORS = {
  login: "Sua sessão expirou. Entre de novo para continuar.",
  plano:
    "As táticas fazem parte da assinatura. Escolha um plano para continuar.",
};

const nextSchema = z.object({
  theme: z.string().nullable(),
  difficulty: z.enum(["facil", "medio", "dificil"]),
});

export async function getNextPuzzle(input: {
  theme: string | null;
  difficulty: Difficulty;
}): Promise<{ ok: true; puzzle: TacticPuzzle } | Failure> {
  const parsed = nextSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Filtro inválido." };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false, error: ACCESS_ERRORS[access.reason] };

  const theme =
    parsed.data.theme && isThemeFilter(parsed.data.theme)
      ? parsed.data.theme
      : null;
  const { rating } = await getMyTacticStats(access.userId);
  const supabase = await createClient();

  // Tenta a faixa escolhida; se acabar, abre a faixa aos poucos.
  const base = difficultyRange(rating, parsed.data.difficulty);
  for (const widen of [0, 250, 600]) {
    const { data, error } = await supabase
      .rpc("next_puzzle", {
        p_min: base.min - widen,
        p_max: base.max + widen,
        p_theme: theme,
      })
      .maybeSingle();
    if (error)
      return { ok: false, error: "Não foi possível carregar um puzzle agora." };
    // Sem tipos gerados do banco, o retorno da função vem sem tipo.
    if (data)
      return {
        ok: true,
        puzzle: toTacticPuzzle(data as Parameters<typeof toTacticPuzzle>[0]),
      };
  }
  return {
    ok: false,
    error: "Não há mais puzzles com esse filtro. Tente outro tema.",
  };
}

// Revisão de hoje: o erro que venceu há mais tempo. `skip` evita repetir o
// puzzle que acabou de ser feito (o vencimento novo ainda pode estar no passado).
export async function getNextReviewPuzzle(input: {
  skip: string | null;
}): Promise<
  { ok: true; puzzle: TacticPuzzle | null; remaining: number } | Failure
> {
  const skip = z.string().max(64).nullable().safeParse(input.skip);
  if (!skip.success) return { ok: false, error: "Pedido inválido." };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false, error: ACCESS_ERRORS[access.reason] };

  const supabase = await createClient();
  let query = supabase
    .from("review_state")
    .select("puzzle_id", { count: "exact" })
    .lte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(1);
  if (skip.data) query = query.neq("puzzle_id", skip.data);
  const { data: due, count, error } = await query;
  if (error)
    return { ok: false, error: "Não foi possível carregar a revisão agora." };
  if (!due?.length) return { ok: true, puzzle: null, remaining: 0 };

  const { data: puzzle } = await supabase
    .from("puzzles")
    .select("id, fen, moves, first_move_is_setup, rating, themes")
    .eq("id", due[0].puzzle_id)
    .maybeSingle();
  if (!puzzle) return { ok: true, puzzle: null, remaining: 0 };
  return {
    ok: true,
    puzzle: toTacticPuzzle(puzzle as Parameters<typeof toTacticPuzzle>[0]),
    remaining: count ?? 1,
  };
}

const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
// Tempo acima disso é tratado como abandono e não distorce as medianas.
const MAX_SECONDS = 600;

const attemptSchema = z.object({
  puzzleId: z.string().min(1).max(64),
  moves: z.array(z.string().regex(UCI)).max(30),
  seconds: z.number().min(0).max(86_400),
});

export type AttemptResult = {
  ok: true;
  solved: boolean;
  rated: boolean;
  ratingBefore: number;
  ratingAfter: number;
};

export async function submitPuzzleAttempt(input: {
  puzzleId: string;
  moves: string[];
  seconds: number;
}): Promise<AttemptResult | Failure> {
  const parsed = attemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Tentativa inválida." };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false, error: ACCESS_ERRORS[access.reason] };

  const { puzzleId, moves } = parsed.data;
  const seconds = Math.min(parsed.data.seconds, MAX_SECONDS);
  const supabase = await createClient();

  const { data: puzzle } = await supabase
    .from("puzzles")
    .select("id, fen, moves, first_move_is_setup, rating")
    .eq("id", puzzleId)
    .maybeSingle();
  if (!puzzle) return { ok: false, error: "Puzzle não encontrado." };

  // A decisão de "resolveu" é do servidor, refazendo os lances enviados.
  const { solved } = evaluateAttempt(puzzle, moves);

  const [{ data: previousAttempts }, { data: review }, stats] =
    await Promise.all([
      supabase
        .from("attempts")
        .select("seconds, solved, rated")
        .eq("puzzle_id", puzzleId),
      supabase
        .from("review_state")
        .select("ease, interval_days, repetitions, lapses")
        .eq("puzzle_id", puzzleId)
        .maybeSingle(),
      getMyTacticStats(access.userId),
    ]);

  // Só a primeira tentativa em cada puzzle mexe no rating.
  const rated = !(previousAttempts ?? []).some((attempt) => attempt.rated);
  const after = rated
    ? nextRating(
        { rating: stats.rating, games: stats.games },
        puzzle.rating ?? stats.rating,
        solved,
      )
    : { rating: stats.rating, games: stats.games };

  const now = new Date();
  const solvedTimes = (previousAttempts ?? [])
    .filter((attempt) => attempt.solved)
    .map((attempt) => Number(attempt.seconds));
  const nextState = nextReview({
    previous: review
      ? {
          ease: Number(review.ease),
          intervalDays: review.interval_days,
          repetitions: review.repetitions,
          lapses: review.lapses,
        }
      : null,
    solved,
    seconds,
    medianSeconds: median(solvedTimes),
    now,
  });

  const { error: attemptError } = await supabase.from("attempts").insert({
    user_id: access.userId,
    puzzle_id: puzzleId,
    solved,
    seconds,
    rated,
    rating_after: rated ? after.rating : null,
  });
  if (attemptError)
    return { ok: false, error: "Não foi possível salvar a tentativa." };
  // Sequência diária: conta o dia de hoje.
  await supabase.rpc("mark_activity");

  // Revisão espaçada: entra quando erra; depois de entrar, acompanha os acertos.
  if (!solved || review) {
    await supabase.from("review_state").upsert({
      user_id: access.userId,
      puzzle_id: puzzleId,
      ease: nextState.ease,
      interval_days: nextState.intervalDays,
      repetitions: nextState.repetitions,
      lapses: nextState.lapses,
      due_at: nextState.dueAt.toISOString(),
      last_result: solved,
      updated_at: now.toISOString(),
    });
  }

  if (rated) {
    // Rating só pelo servidor, com a service role (o aluno não tem permissão de escrita).
    try {
      const { error } = await createAdminClient()
        .from("user_stats")
        .upsert({
          user_id: access.userId,
          puzzle_rating: after.rating,
          puzzle_games: after.games,
          puzzles_solved: stats.solved + (solved ? 1 : 0),
          last_puzzle_at: now.toISOString(),
          updated_at: now.toISOString(),
        });
      if (error) throw error;
    } catch (error) {
      console.error("Falha ao gravar o rating", error);
      return {
        ok: false,
        error: "Não foi possível atualizar seu rating agora.",
      };
    }
  }

  return {
    ok: true,
    solved,
    rated,
    ratingBefore: stats.rating,
    ratingAfter: after.rating,
  };
}
