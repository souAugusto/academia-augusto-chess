import type { MetadataRoute } from "next";
import { BRAND } from "@/content/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.fullName,
    short_name: BRAND.shortName,
    description: BRAND.description,
    lang: "pt-BR",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B0D12",
    theme_color: "#0B0D12",
    categories: ["education", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
