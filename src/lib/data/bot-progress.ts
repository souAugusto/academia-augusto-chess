import "server-only";
import { BOTS } from "@/content/personagens";
import { parseProgress, type Progress } from "@/lib/bot/progress";
import { createClient } from "@/lib/supabase/server";

// Quem está jogando (se tiver conta) e o progresso salvo na conta.
export async function getBotPlayer(): Promise<{
  loggedIn: boolean;
  progress: Progress;
}> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) return { loggedIn: false, progress: {} };
  const { data } = await supabase
    .from("bot_progress")
    .select("bot_id, vitorias, derrotas, empates, estrelas")
    .eq("user_id", userId);
  const raw = Object.fromEntries((data ?? []).map((row) => [row.bot_id, row]));
  return {
    loggedIn: true,
    progress: parseProgress(
      raw,
      BOTS.map((bot) => bot.id),
    ),
  };
}
