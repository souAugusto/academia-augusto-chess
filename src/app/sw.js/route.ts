// Service worker da Finale, gerado no build com a versão da publicação: cada
// deploy muda o arquivo, o navegador percebe a versão nova e a tela oferece
// "Atualizar" (sem recarregar sozinha). Escrito à mão porque o plugin oficial
// (Serwist) depende do webpack, e o projeto compila com o Turbopack.
//
// Regras:
// - Arquivos com nome versionado (/_next/static, /engine): cache primeiro.
// - Peças, ícones e logo: stale-while-revalidate (abre do cache e atualiza).
// - Páginas públicas: rede primeiro, cópia em cache para abrir sem internet.
// - Login, API, autenticação e páginas com dados do aluno: SEMPRE rede, nunca
//   guardadas (privacidade em aparelho compartilhado).
// - Sem rede e sem cópia: página /offline.
export const dynamic = "force-static";

const VERSION = (
  process.env.VERCEL_GIT_COMMIT_SHA ?? String(Date.now())
).slice(0, 12);

const SOURCE = `
const VERSION = ${JSON.stringify(VERSION)};
// Caches com nome fixo para o que não muda a cada deploy (motor, peças):
// não são baixados de novo a cada publicação.
const IMMUTABLE_CACHE = "finale-imutavel-v1";
const ASSETS_CACHE = "finale-arquivos-v1";
const PAGES_CACHE = "finale-paginas-" + VERSION;
const KEEP = Array.of(IMMUTABLE_CACHE, ASSETS_CACHE, PAGES_CACHE);

const PIECES = ["K", "Q", "R", "B", "N", "P"].flatMap((p) => [
  "/pieces/cburnett/w" + p + ".svg",
  "/pieces/cburnett/b" + p + ".svg",
]);
// "Casca" do app: abre sem internet (página inicial, offline e ícones).
const APP_SHELL = ["/", "/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/brand/finale-icone-app.svg"];

const PUBLIC_PAGES = ["/", "/planos", "/puzzle-do-dia", "/termos", "/privacidade", "/creditos", "/como-analisamos", "/offline"];
const IMMUTABLE_PREFIXES = ["/_next/static/", "/engine/"];
const ASSET_PREFIXES = ["/pieces/", "/icons/", "/brand/"];
// Nunca passam pelo cache (sempre rede).
const NEVER = ["/api/", "/auth/", "/entrar", "/recuperar-senha", "/redefinir-senha", "/checkout", "/sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(PAGES_CACHE).then((cache) => cache.addAll(APP_SHELL)),
      caches.open(ASSETS_CACHE).then((cache) => cache.addAll(PIECES)),
    ]),
  );
  // Sem skipWaiting: a versão nova espera o aluno tocar em "Atualizar".
});

self.addEventListener("message", (event) => {
  if (event.data === "atualizar") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !KEEP.includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER.some((prefix) => url.pathname.startsWith(prefix))) return;
  // Pedidos de dados do Next (RSC) e de server actions: sempre rede.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (IMMUTABLE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(cacheFirst(request));
  } else if (ASSET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(staleWhileRevalidate(request, event));
  } else if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request, url));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(IMMUTABLE_CACHE)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(ASSETS_CACHE);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(update);
    return cached;
  }
  return (await update) || Response.error();
}

async function networkFirstPage(request, url) {
  const isPublic = PUBLIC_PAGES.includes(url.pathname);
  try {
    const response = await fetch(request);
    // Só páginas públicas, sem redirecionamento (logado vai para o painel).
    if (isPublic && response.ok && !response.redirected) {
      (await caches.open(PAGES_CACHE)).put(url.pathname, response.clone());
    }
    return response;
  } catch {
    const cached = isPublic ? await caches.match(url.pathname) : undefined;
    return cached || (await caches.match("/offline")) || Response.error();
  }
}
`;

export function GET() {
  return new Response(SOURCE, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
