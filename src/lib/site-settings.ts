// Interruptores do site (tabela site_settings, migration 0023). Lógica pura,
// testável, usada no servidor e no navegador.
//
// Para criar um interruptor novo (ex.: esconder outra aba):
// 1. acrescente a chave em SITE_FLAGS (rótulo, aviso e o que ela esconde);
// 2. insira a linha na tabela por migration (padrão: ligado);
// 3. se a área tiver dados no banco, inclua site_setting_enabled('<chave>') no
//    RLS dela, como em courses (0023).

export const SITE_FLAGS = {
  video_lessons_enabled: {
    label: "Exibir aba de aulas em vídeo",
    offWarning:
      'A aba Aulas some do menu, do painel e da página inicial para todos os alunos, e os endereços das aulas passam a mostrar "temporariamente indisponível". Nada é apagado.',
    section: "aulas", // id da área em src/components/app/modules.ts
    paths: ["/aulas"], // endereços bloqueados (e tudo abaixo deles)
  },
} as const;

export type SiteFlag = keyof typeof SITE_FLAGS;
export type SiteSettings = Record<SiteFlag, boolean>;

export const SITE_SETTINGS_TAG = "site-settings";
export const SITE_SETTINGS_POLL_MS = 60_000;

// Padrão seguro: tudo ligado (o site continua como era).
export const DEFAULT_SITE_SETTINGS: SiteSettings = Object.fromEntries(
  Object.keys(SITE_FLAGS).map((key) => [key, true]),
) as SiteSettings;

export function isSiteFlag(key: string): key is SiteFlag {
  return Object.hasOwn(SITE_FLAGS, key);
}

// Linhas do banco -> configurações. Chave desconhecida é ignorada; chave que
// falta (ou valor estranho) fica no padrão.
export function parseSiteSettings(rows: unknown): SiteSettings {
  const settings = { ...DEFAULT_SITE_SETTINGS };
  if (!Array.isArray(rows)) return settings;
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const { key, enabled } = row as { key?: unknown; enabled?: unknown };
    if (
      typeof key === "string" &&
      isSiteFlag(key) &&
      typeof enabled === "boolean"
    )
      settings[key] = enabled;
  }
  return settings;
}

// Áreas do app (ids de modules.ts) desligadas.
export function hiddenSections(settings: SiteSettings): Set<string> {
  return new Set(
    (Object.keys(SITE_FLAGS) as SiteFlag[])
      .filter((flag) => !settings[flag])
      .map((flag) => SITE_FLAGS[flag].section),
  );
}

// O endereço pertence a uma área desligada? Devolve o interruptor responsável.
export function flagForPath(
  pathname: string,
  settings: SiteSettings,
): SiteFlag | null {
  for (const flag of Object.keys(SITE_FLAGS) as SiteFlag[]) {
    if (settings[flag]) continue;
    if (
      SITE_FLAGS[flag].paths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`),
      )
    )
      return flag;
  }
  return null;
}

// Quem enxerga a área: todos se ligada; só o admin se desligada.
export function canSee(
  flag: SiteFlag,
  settings: SiteSettings,
  isAdmin: boolean,
): boolean {
  return settings[flag] || isAdmin;
}

// Áreas do menu: com a área desligada, o aluno não vê; o admin vê com o
// selo "oculta para usuários".
export function visibleSections<T extends { id: string }>(
  sections: readonly T[],
  settings: SiteSettings,
  isAdmin: boolean,
): (T & { hiddenForUsers: boolean })[] {
  const hidden = hiddenSections(settings);
  return sections
    .filter((section) => isAdmin || !hidden.has(section.id))
    .map((section) => ({ ...section, hiddenForUsers: hidden.has(section.id) }));
}

export function sameSettings(a: SiteSettings, b: SiteSettings): boolean {
  return (Object.keys(SITE_FLAGS) as SiteFlag[]).every(
    (flag) => a[flag] === b[flag],
  );
}
