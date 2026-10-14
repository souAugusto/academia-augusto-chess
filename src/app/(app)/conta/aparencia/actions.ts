"use server";

import {
  isEmptyPreferences,
  MAX_PREFERENCES_BYTES,
  parsePreferences,
  preferencesSize,
  type Preferences,
} from "@/lib/preferences/schema";
import { createClient } from "@/lib/supabase/server";

// Preferências do aluno logado. Visitantes recebem { logged: false } e usam só
// o localStorage. `prefs: null` = nunca salvou no servidor.
export async function getMyPreferences(): Promise<
  { logged: false } | { logged: true; prefs: Preferences | null }
> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { logged: false };
  const { data } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", auth.user.id)
    .maybeSingle();
  const raw = data?.preferences;
  return {
    logged: true,
    prefs: isEmptyPreferences(raw) ? null : parsePreferences(raw),
  };
}

// Grava as preferências do próprio aluno. O valor é refeito no servidor a
// partir da lista fechada: chave desconhecida ou valor fora da lista não passa.
export async function savePreferences(
  input: unknown,
): Promise<{ ok: boolean }> {
  const prefs = parsePreferences(input);
  if (preferencesSize(prefs) > MAX_PREFERENCES_BYTES) return { ok: false };
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false };
  const { error } = await supabase
    .from("profiles")
    .update({ preferences: prefs })
    .eq("id", auth.user.id);
  return { ok: !error };
}
