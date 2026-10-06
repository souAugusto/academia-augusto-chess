import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import { routeRedirect } from "@/lib/routes";

// Renova o token de sessão do Supabase a cada requisição e aplica a proteção de
// rotas por sessão. O acesso por plano é checado nas páginas, no servidor (Fase 3).
export async function updateSession(request: NextRequest) {
  const env = publicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Não colocar código entre a criação do cliente e esta chamada.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname, search } = request.nextUrl;
  const target = routeRedirect(pathname, search, isLoggedIn);
  if (!target) return response;

  // Redireciona levando junto os cookies de sessão renovados.
  const redirect = NextResponse.redirect(new URL(target, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
