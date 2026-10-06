import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

// Cliente para Client Components. Usa só a chave pública; o RLS protege os dados.
export function createClient() {
  const env = publicEnv();
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
