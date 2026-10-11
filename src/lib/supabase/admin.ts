import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { publicEnv } from "@/lib/env";

// Cliente com a service role: ignora o RLS. Só para o servidor (webhook de
// pagamento, reserva de vagas, admin). Nunca importar em Client Components.
export function createAdminClient() {
  const serviceRoleKey = z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY não definida")
    .parse(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return createClient(publicEnv().NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
