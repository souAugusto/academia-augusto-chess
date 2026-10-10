import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://finale-xadrez.vercel.app";

// Só páginas públicas. Entram mais à medida que as fases criam páginas.
const PUBLIC_PATHS = [
  "/",
  "/planos",
  "/puzzle-do-dia",
  "/entrar",
  "/termos",
  "/privacidade",
  "/creditos",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: `${SITE}${path}`,
    changeFrequency: path === "/" ? "daily" : "monthly",
    priority: path === "/" ? 1 : 0.5,
  }));
}
