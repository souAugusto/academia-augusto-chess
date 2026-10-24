"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { isSiteFlag, SITE_SETTINGS_TAG } from "@/lib/site-settings";
import { createClient } from "@/lib/supabase/server";
import {
  liveSchema,
  SETTING_KEYS,
  settingsSchema,
} from "@/lib/validation/admin";

export async function saveSettings(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formObject(formData, SETTING_KEYS));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const supabase = await createClient();
  for (const key of SETTING_KEYS) {
    const value = parsed.data[key];
    const { error } = value
      ? await supabase.from("app_settings").upsert({ key, value })
      : await supabase.from("app_settings").delete().eq("key", key);
    if (error) return { message: error.message };
  }
  revalidatePath("/", "layout");
  return { success: "Links salvos." };
}

export async function createLive(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = liveSchema.safeParse(
    formObject(formData, ["title", "startsAt", "url", "audience"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { title, startsAt, url, audience } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("live_events")
    .insert({ title, starts_at: startsAt, url, audience });
  if (error) return { message: error.message };
  revalidatePath("/", "layout");
  return { success: "Live agendada." };
}

export async function deleteLive(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Live inválida." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("live_events")
    .delete()
    .eq("id", id.data);
  if (error) return { message: error.message };
  revalidatePath("/", "layout");
  return { success: "Live apagada." };
}

const flagSchema = z.object({
  key: z.string().refine(isSiteFlag, "Configuração desconhecida."),
  enabled: z.boolean(),
});

// Liga ou desliga uma área do site (site_settings). Vale na hora: expira o
// cache das configurações e das páginas. Quando e quem alterou fica no banco.
export async function setSiteFlag(input: {
  key: string;
  enabled: boolean;
}): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const parsed = flagSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: zodMessage(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: parsed.data.key, enabled: parsed.data.enabled });
  if (error)
    return { ok: false, message: "Não consegui salvar. Tente de novo." };
  updateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: parsed.data.enabled
      ? "Aba exibida para todos."
      : "Aba oculta para os usuários.",
  };
}
