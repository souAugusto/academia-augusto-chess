import { describe, expect, it } from "vitest";
import { googleAuthUrl, parseGoogleCookie, sha256Hex } from "./google";

describe("login com Google pelo nosso domínio", () => {
  it("monta a URL do Google com o retorno no nosso domínio e o nonce com hash", () => {
    const url = new URL(
      googleAuthUrl({
        clientId: "abc.apps.googleusercontent.com",
        redirectUri: "https://www.academiafinale.site/auth/google/callback",
        state: "estado-aleatorio-123456",
        nonce: "nonce-puro-1234567890",
      }),
    );
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://www.academiafinale.site/auth/google/callback",
    );
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("nonce")).toBe(sha256Hex("nonce-puro-1234567890"));
    expect(url.searchParams.get("nonce")).not.toBe("nonce-puro-1234567890");
  });

  it("só aceita o cookie de retorno completo", () => {
    const ok = { state: "s".repeat(32), nonce: "n".repeat(32), next: "/planos" };
    expect(parseGoogleCookie(JSON.stringify(ok))).toEqual(ok);
    expect(parseGoogleCookie(undefined)).toBeNull();
    expect(parseGoogleCookie("lixo")).toBeNull();
    expect(parseGoogleCookie(JSON.stringify({ ...ok, state: "curto" }))).toBeNull();
  });

  it("sha256 confere com um valor conhecido", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
