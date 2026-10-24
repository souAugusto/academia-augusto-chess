import { describe, expect, it } from "vitest";
import {
  canSee,
  DEFAULT_SITE_SETTINGS,
  flagForPath,
  hiddenSections,
  parseSiteSettings,
  sameSettings,
  visibleSections,
} from "./site-settings";

const OFF = { ...DEFAULT_SITE_SETTINGS, video_lessons_enabled: false };
const SECTIONS = [
  { id: "painel", href: "/painel" },
  { id: "aulas", href: "/aulas" },
  { id: "jogar", href: "/jogar" },
];

describe("interruptores do site", () => {
  it("padrão seguro: tudo ligado", () => {
    expect(DEFAULT_SITE_SETTINGS.video_lessons_enabled).toBe(true);
    expect(parseSiteSettings(null)).toEqual(DEFAULT_SITE_SETTINGS);
    expect(parseSiteSettings([])).toEqual(DEFAULT_SITE_SETTINGS);
    expect(
      parseSiteSettings([{ key: "video_lessons_enabled", enabled: "não" }]),
    ).toEqual(DEFAULT_SITE_SETTINGS);
  });

  it("lê o banco e ignora chaves desconhecidas", () => {
    expect(
      parseSiteSettings([
        { key: "video_lessons_enabled", enabled: false },
        { key: "outra_coisa", enabled: false },
      ]),
    ).toEqual(OFF);
  });

  it("bloqueia os endereços da área desligada", () => {
    expect(flagForPath("/aulas", OFF)).toBe("video_lessons_enabled");
    expect(flagForPath("/aulas/curso/aula", OFF)).toBe("video_lessons_enabled");
    expect(flagForPath("/aulasx", OFF)).toBeNull();
    expect(flagForPath("/taticas", OFF)).toBeNull();
    expect(flagForPath("/aulas", DEFAULT_SITE_SETTINGS)).toBeNull();
  });

  it("menu: aluno não vê; admin vê com selo", () => {
    expect(hiddenSections(OFF)).toEqual(new Set(["aulas"]));
    expect(visibleSections(SECTIONS, OFF, false).map((s) => s.id)).toEqual([
      "painel",
      "jogar",
    ]);
    const admin = visibleSections(SECTIONS, OFF, true);
    expect(admin.map((s) => s.id)).toEqual(["painel", "aulas", "jogar"]);
    expect(admin.find((s) => s.id === "aulas")?.hiddenForUsers).toBe(true);
    expect(
      visibleSections(SECTIONS, DEFAULT_SITE_SETTINGS, false),
    ).toHaveLength(3);
    expect(canSee("video_lessons_enabled", OFF, false)).toBe(false);
    expect(canSee("video_lessons_enabled", OFF, true)).toBe(true);
  });

  it("compara configurações", () => {
    expect(sameSettings(OFF, { ...OFF })).toBe(true);
    expect(sameSettings(OFF, DEFAULT_SITE_SETTINGS)).toBe(false);
  });
});
