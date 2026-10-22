import { describe, expect, it } from "vitest";
import { canInstall, detectPlatform, DISMISS_DAYS, shouldOffer } from "./install";

const UA = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1",
  ipad: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  android:
    "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
  samsung:
    "Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0 Mobile Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
};

describe("detectPlatform", () => {
  it("reconhece os aparelhos", () => {
    expect(detectPlatform(UA.iphoneSafari)).toBe("ios-safari");
    expect(detectPlatform(UA.iphoneChrome)).toBe("ios-outro");
    expect(detectPlatform(UA.ipad, 5)).toBe("ios-safari");
    expect(detectPlatform(UA.ipad, 0)).toBe("desktop");
    expect(detectPlatform(UA.android)).toBe("android");
    expect(detectPlatform(UA.samsung)).toBe("android");
    expect(detectPlatform(UA.windows)).toBe("desktop");
  });
});

describe("shouldOffer", () => {
  const now = Date.UTC(2026, 9, 22);
  const base = {
    platform: "android" as const,
    standalone: false,
    installed: false,
    dismissedAt: null,
    hasPrompt: true,
    now,
  };

  it("Android só com o evento do navegador; iOS sempre (passo a passo)", () => {
    expect(shouldOffer(base)).toBe(true);
    expect(shouldOffer({ ...base, hasPrompt: false })).toBe(false);
    expect(shouldOffer({ ...base, platform: "ios-safari", hasPrompt: false })).toBe(true);
    expect(shouldOffer({ ...base, platform: "ios-outro", hasPrompt: false })).toBe(true);
    expect(shouldOffer({ ...base, platform: "desktop" })).toBe(false);
  });

  it("nunca se já é app ou já instalou", () => {
    expect(shouldOffer({ ...base, standalone: true })).toBe(false);
    expect(shouldOffer({ ...base, installed: true })).toBe(false);
  });

  it("'Agora não' esconde por 7 dias", () => {
    const day = 24 * 60 * 60 * 1000;
    expect(shouldOffer({ ...base, dismissedAt: now - (DISMISS_DAYS - 1) * day })).toBe(false);
    expect(shouldOffer({ ...base, dismissedAt: now - DISMISS_DAYS * day })).toBe(true);
  });

  it("botão manual aparece mesmo depois de 'Agora não'", () => {
    expect(canInstall({ platform: "android", standalone: false, installed: false, hasPrompt: true })).toBe(true);
    expect(canInstall({ platform: "ios-safari", standalone: false, installed: false, hasPrompt: false })).toBe(true);
    expect(canInstall({ platform: "android", standalone: false, installed: false, hasPrompt: false })).toBe(false);
    expect(canInstall({ platform: "ios-safari", standalone: true, installed: false, hasPrompt: false })).toBe(false);
  });
});
