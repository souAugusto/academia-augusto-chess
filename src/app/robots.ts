import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://academia-augusto-chess.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Área do aluno, admin e rotas técnicas não interessam aos buscadores.
      disallow: [
        "/painel",
        "/conta",
        "/admin",
        "/auth/",
        "/redefinir-senha",
        "/offline",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
