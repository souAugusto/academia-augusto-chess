import { getMyNotifications } from "@/lib/data/notifications";
import { createClient } from "@/lib/supabase/server";
import { NotificationBell } from "./NotificationBell";

// Sino do cabeçalho do app: o resumo vem pronto do servidor (sem esperar o
// navegador) e depois se atualiza sozinho.
export async function HeaderNotifications() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub as string | undefined;
  if (!userId) return null;
  const feed = await getMyNotifications(userId, 10);
  return <NotificationBell initial={feed} />;
}
