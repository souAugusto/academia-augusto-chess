import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

// Destino dos links de e-mail (confirmação, nova senha) e do retorno do Google.
// Aceita os dois formatos do Supabase:
// - token_hash + type: template de e-mail apontando direto para cá (recomendado)
// - code: fluxo PKCE padrão (só funciona no mesmo navegador que pediu o link)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get("next"), "/painel");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  let ok = false;

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (!ok) return NextResponse.redirect(new URL("/entrar?erro=link", origin));

  // Quem entra pelo Google aceita os termos pelo aviso ao lado do botão.
  // Para quem se cadastrou por e-mail, o aceite já foi gravado no cadastro.
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (userId) {
    await supabase
      .from("profiles")
      .update({ terms_accepted_at: new Date().toISOString() })
      .eq("id", userId)
      .is("terms_accepted_at", null);
  }

  return NextResponse.redirect(new URL(next, origin));
}
