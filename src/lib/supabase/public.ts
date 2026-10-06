import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

// Cliente anônimo, sem cookies: para dados públicos em páginas cacheáveis
// (Home, /planos). Enxerga só o que o RLS libera para visitantes.
export function createPublicClient() {
  const env = publicEnv();
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
