import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/content/brand";

// Imagem mostrada ao compartilhar o site (WhatsApp, Facebook, etc.).
export const alt = `${BRAND.fullName}: ${BRAND.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const icon = await readFile(join(process.cwd(), "src/app/icon.svg"));
  const iconSrc = `data:image/svg+xml;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background:
          "radial-gradient(900px 500px at 10% 0%, rgba(232,184,74,0.22), transparent 70%), #0B0D12",
        color: "#EDEFF5",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img src={iconSrc} width={96} height={96} alt="" />
        <span style={{ fontSize: 56, fontWeight: 700 }}>Finale</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <span
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            maxWidth: 950,
          }}
        >
          Treino de xadrez com método.
        </span>
        <span style={{ fontSize: 34, color: "#9AA3B8" }}>
          Táticas, aberturas, finais e aulas em vídeo.
        </span>
      </div>
      <div
        style={{
          display: "flex",
          height: 8,
          width: 220,
          borderRadius: 999,
          background: "#E8B84A",
        }}
      />
    </div>,
    size,
  );
}
