// Service worker da Finale: modo offline básico.
// - Arquivos estáticos (JS/CSS do Next, fontes, peças, ícones): cache primeiro.
// - Páginas públicas: rede primeiro, cópia em cache para abrir sem internet.
// - Páginas com dados do aluno NUNCA são guardadas (privacidade em aparelho compartilhado).
// Ao mudar a lógica, troque VERSION para descartar o cache antigo.
const VERSION = "finale-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;

const PIECES = ["K", "Q", "R", "B", "N", "P"].flatMap((p) => [
  `/pieces/cburnett/w${p}.svg`,
  `/pieces/cburnett/b${p}.svg`,
]);
const PRECACHE = [
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  ...PIECES,
];

const PUBLIC_PAGES = [
  "/",
  "/planos",
  "/puzzle-do-dia",
  "/termos",
  "/privacidade",
  "/creditos",
  "/offline",
];
const STATIC_PREFIXES = ["/_next/static/", "/pieces/", "/icons/", "/engine/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request, url));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstPage(request, url) {
  const isPublic = PUBLIC_PAGES.includes(url.pathname);
  try {
    const response = await fetch(request);
    if (isPublic && response.ok && !response.redirected) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(url.pathname, response.clone());
    }
    return response;
  } catch {
    const cached = isPublic ? await caches.match(url.pathname) : undefined;
    return cached || (await caches.match("/offline")) || Response.error();
  }
}
