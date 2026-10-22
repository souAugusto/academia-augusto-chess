import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Upload de PDF/PGN das aulas pelo admin. A Vercel aceita até 4,5 MB por requisição.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // Arquivos do motor (versão no nome do arquivo): cache longo no navegador
        // e na CDN. Se a versão mudar, o nome do arquivo muda junto.
        source: "/engine/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Peças, vídeo da página inicial e licenças: os nomes não mudam a cada
        // versão, então cache de 7 dias com atualização em segundo plano (uma
        // troca de arquivo chega em até uma semana, sem travar ninguém).
        source: "/:dir(pieces|videos|licencas)/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // O service worker nunca fica em cache, para as atualizações chegarem logo.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
