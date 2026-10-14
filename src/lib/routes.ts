// Regras de acesso por sessão. O acesso por plano entra na Fase 4 (monetização),
// sempre checado no servidor.

// Área do aluno e admin: exigem login.
const PROTECTED_PREFIXES = [
  "/painel",
  "/taticas",
  "/aberturas",
  "/finais",
  "/aulas",
  "/treino",
  "/conta",
  "/checkout",
  "/questionario",
  "/partidas",
  "/licoes",
  "/analise",
  "/titulos",
  "/comunidade",
  "/teste-gratis",
  "/admin",
  "/redefinir-senha",
];

// Só fazem sentido para quem ainda não entrou.
const GUEST_ONLY = ["/entrar"];

export const HOME_LOGGED_IN = "/painel";

function matches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matches(pathname, prefix));
}

// Destino de redirecionamento só pode ser um caminho interno. Evita "open redirect"
// com valores como "//site.com" ou "https://site.com".
export function safeNextPath(
  next: string | null | undefined,
  fallback: string,
): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return fallback;
  }
  return next;
}

// Para onde mandar a requisição, ou null para seguir normalmente.
export function routeRedirect(
  pathname: string,
  search: string,
  isLoggedIn: boolean,
): string | null {
  if (!isLoggedIn && isProtectedPath(pathname)) {
    return `/entrar?next=${encodeURIComponent(pathname + search)}`;
  }
  // Já logado em /entrar: segue para onde ia (ex.: ativar o teste grátis).
  if (isLoggedIn && GUEST_ONLY.some((prefix) => matches(pathname, prefix))) {
    return safeNextPath(
      new URLSearchParams(search).get("next"),
      HOME_LOGGED_IN,
    );
  }
  return null;
}
