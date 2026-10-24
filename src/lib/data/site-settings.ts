import "server-only";
import { unstable_cache } from "next/cache";
import {
  DEFAULT_SITE_SETTINGS,
  parseSiteSettings,
  SITE_SETTINGS_TAG,
  type SiteFlag,
  type SiteSettings,
} from "@/lib/site-settings";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

// Interruptores do site, lidos uma vez e guardados no cache do servidor. O
// admin, ao mudar, expira o cache na hora (updateTag); os 60 s são só uma
// rede de segurança. Se a leitura falhar, vale o padrão (tudo ligado).
export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const { data, error } = await createPublicClient()
      .from("site_settings")
      .select("key, enabled");
    if (error) {
      console.error("Configurações do site indisponíveis:", error.message);
      return DEFAULT_SITE_SETTINGS;
    }
    return parseSiteSettings(data);
  },
  ["site-settings"],
  { tags: [SITE_SETTINGS_TAG], revalidate: 60 },
);

// Quem está vendo é admin? (Admin enxerga as áreas desligadas.)
export async function viewerIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims.sub) return false;
  const { data } = await supabase.rpc("is_admin");
  return data === true;
}

// A área pode ser usada por quem está vendo? Para páginas, actions e APIs.
export async function siteFlagAllowed(flag: SiteFlag): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings[flag] || (await viewerIsAdmin());
}
