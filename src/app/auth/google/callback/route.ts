import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  GOOGLE_CALLBACK_PATH,
  GOOGLE_COOKIE,
  GOOGLE_TOKEN_URL,
  googleConfig,
  parseGoogleCookie,
} from "@/lib/auth/google";
import { safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

const same = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// Retorno do Google (ver src/lib/auth/google.ts). Confere o "state" (contra
// falsificação de pedido), troca o código pelo id_token no servidor e entra no
// Supabase com ele.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const fail = () =>
    NextResponse.redirect(new URL("/entrar?erro=google", origin));

  const store = await cookies();
  const saved = parseGoogleCookie(store.get(GOOGLE_COOKIE)?.value);
  // Uso único: apaga o cookie (mesmo caminho em que foi gravado).
  store.set(GOOGLE_COOKIE, "", { path: GOOGLE_CALLBACK_PATH, maxAge: 0 });
  const config = googleConfig();
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "";
  if (!saved || !config || !code || !same(state, saved.state)) return fail();

  let idToken: string | undefined;
  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: `${origin}${GOOGLE_CALLBACK_PATH}`,
        grant_type: "authorization_code",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return fail();
    idToken = ((await response.json()) as { id_token?: string }).id_token;
  } catch {
    return fail();
  }
  if (!idToken) return fail();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
    nonce: saved.nonce,
  });
  if (error || !data.user) return fail();

  // Quem entra pelo Google aceita os termos pelo aviso ao lado do botão.
  await supabase
    .from("profiles")
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq("id", data.user.id)
    .is("terms_accepted_at", null);

  return NextResponse.redirect(
    new URL(safeNextPath(saved.next, "/painel"), origin),
  );
}
