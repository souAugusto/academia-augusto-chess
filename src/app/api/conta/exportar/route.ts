import { createClient } from "@/lib/supabase/server";

// "Baixar meus dados" (LGPD): tudo o que a Finale guarda do aluno, em JSON.
// Lido com a sessão do próprio aluno, então a RLS garante que só vêm os dados
// dele. Senha e dados de pagamento do cartão nunca passam pela Finale.
const TABLES: {
  key: string;
  table: string;
  columns: string;
  owner?: string;
}[] = [
  {
    key: "assinaturas",
    table: "subscriptions",
    columns:
      "plan_id, status, source, billing_type, current_period_end, cancel_at_period_end, created_at",
  },
  {
    key: "estatisticas_taticas",
    table: "user_stats",
    columns: "puzzle_rating, puzzle_games, puzzles_solved, last_puzzle_at",
  },
  {
    key: "titulos",
    table: "user_titles",
    columns: "earned_at, titles (name, min_rating)",
  },
  {
    key: "tentativas_de_puzzles",
    table: "attempts",
    columns: "puzzle_id, solved, seconds, rated, rating_after, created_at",
  },
  {
    key: "revisao",
    table: "review_state",
    columns: "puzzle_id, due_at, repetitions, lapses, last_result",
  },
  { key: "dias_de_treino", table: "user_activity", columns: "day" },
  {
    key: "licoes",
    table: "lesson_study",
    columns:
      "lesson_slug, practice_solved, practice_total, quiz_score, quiz_total, completed_at",
  },
  { key: "aulas", table: "lesson_progress", columns: "*" },
  { key: "repertorios", table: "repertoire_progress", columns: "*" },
  { key: "finais", table: "endgame_attempts", columns: "*" },
  { key: "ciclos", table: "cycles", columns: "*" },
  {
    key: "contas_vinculadas",
    table: "linked_accounts",
    columns: "platform, username, last_import_at",
  },
  {
    key: "partidas_importadas",
    table: "imported_games",
    columns:
      "platform, external_id, played_at, color, result, opening_name, time_class",
  },
  {
    key: "analises",
    table: "game_analyses",
    columns: "title, depth, accuracy_white, accuracy_black, created_at",
  },
  { key: "estilo", table: "player_styles", columns: "style, updated_at" },
  {
    key: "respostas_do_teste_de_estilo",
    table: "style_results",
    columns: "style, created_at",
  },
];

export async function GET() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return new Response("Entre na sua conta.", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "name, display_name, bio, whatsapp, location, declared_rating, show_in_ranking, preferences, created_at",
    )
    .eq("id", user.id)
    .single();
  const sections = await Promise.all(
    TABLES.map(async ({ key, table, columns }) => {
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq("user_id", user.id);
      return [key, error ? { erro: "não foi possível ler" } : (data ?? [])];
    }),
  );
  const body = {
    gerado_em: new Date().toISOString(),
    conta: { email: user.email, criada_em: user.created_at },
    perfil: profile,
    ...Object.fromEntries(sections),
  };
  const day = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="finale-meus-dados-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
