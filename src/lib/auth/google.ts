// Login com o Google pelo nosso domínio (www.academiafinale.site): o Google
// devolve o aluno para /auth/google/callback, o servidor troca o código pelo
// id_token e entra no Supabase com ele (signInWithIdToken). Assim a tela do
// Google mostra o nosso domínio, e não o endereço técnico do Supabase.
// Lógica pura aqui; cookies e rede ficam na action e na rota.
import { createHash, randomBytes } from "node:crypto";

export const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const GOOGLE_COOKIE = "finale_google";
export const GOOGLE_CALLBACK_PATH = "/auth/google/callback";

export function googleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export const randomToken = () => randomBytes(24).toString("base64url");

// O Google recebe o nonce com hash; o Supabase recebe o nonce puro e confere.
export const sha256Hex = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export function googleAuthUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  nonce: string; // puro (o hash vai na URL)
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    nonce: sha256Hex(input.nonce),
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export type GoogleCookie = { state: string; nonce: string; next: string };

export function parseGoogleCookie(value: string | undefined): GoogleCookie | null {
  if (!value) return null;
  try {
    const data = JSON.parse(value) as Partial<GoogleCookie>;
    if (
      typeof data.state === "string" &&
      typeof data.nonce === "string" &&
      typeof data.next === "string" &&
      data.state.length >= 16 &&
      data.nonce.length >= 16
    )
      return data as GoogleCookie;
  } catch {
    // Cookie adulterado ou antigo.
  }
  return null;
}
