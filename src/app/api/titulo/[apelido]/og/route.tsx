import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND } from "@/content/brand";
import { NICKNAME_RE } from "@/lib/profile/nickname";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Imagem para compartilhar o título (quadrada ou vertical, para stories).
// Mostra só apelido, título e o nome da academia: nada privado.
// Só sai a imagem de quem aparece no ranking, ou do próprio aluno logado.
const FORMATS = {
  quadrado: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
} as const;

export async function GET(
  request: Request,
  { params }: RouteContext<"/api/titulo/[apelido]/og">,
) {
  const { apelido } = await params;
  const nickname = decodeURIComponent(apelido);
  if (!NICKNAME_RE.test(nickname))
    return new Response("Não encontrado", { status: 404 });
  const format =
    new URL(request.url).searchParams.get("formato") === "vertical"
      ? "vertical"
      : "quadrado";

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, display_name, show_in_ranking")
    .eq("display_name", nickname)
    .maybeSingle();
  if (!profile) return new Response("Não encontrado", { status: 404 });
  if (!profile.show_in_ranking) {
    const { data: auth } = await (await createClient()).auth.getUser();
    if (auth.user?.id !== profile.id)
      return new Response("Não encontrado", { status: 404 });
  }
  const { data: earned } = await admin
    .from("user_titles")
    .select("titles (name, tagline, color, min_rating)")
    .eq("user_id", profile.id);
  type Row = {
    titles: {
      name: string;
      tagline: string | null;
      color: string;
      min_rating: number;
    } | null;
  };
  const title = ((earned ?? []) as unknown as Row[])
    .map((row) => row.titles)
    .filter((t) => t !== null)
    .sort((a, b) => b.min_rating - a.min_rating)[0];
  if (!title) return new Response("Não encontrado", { status: 404 });

  const icon = await readFile(join(process.cwd(), "src/app/icon.svg"));
  const iconSrc = `data:image/svg+xml;base64,${icon.toString("base64")}`;
  const size = FORMATS[format];
  const tall = format === "vertical";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: tall ? "160px 80px" : 80,
        background: `radial-gradient(800px 600px at 50% 35%, ${title.color}33, transparent 70%), #0B0D12`,
        color: "#EDEFF5",
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img src={iconSrc} width={72} height={72} alt="" />
        <span style={{ fontSize: 44, fontWeight: 700 }}>{BRAND.fullName}</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <svg
          width={tall ? 300 : 240}
          height={tall ? 300 : 240}
          viewBox="0 0 24 24"
        >
          <path
            fill={title.color}
            d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 5 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5L12 7Z"
          />
        </svg>
        <span style={{ fontSize: 40, color: "#9AA3B8" }}>
          {profile.display_name} conquistou o título
        </span>
        <span
          style={{
            fontSize: tall ? 104 : 88,
            fontWeight: 700,
            lineHeight: 1.05,
            color: title.color,
            maxWidth: 920,
          }}
        >
          {title.name}
        </span>
        {title.tagline && (
          <span style={{ fontSize: 38, color: "#EDEFF5", maxWidth: 860 }}>
            {title.tagline}
          </span>
        )}
      </div>
      <span style={{ fontSize: 28, color: "#9AA3B8" }}>
        Título do rating tático, medido nos puzzles da academia
      </span>
    </div>,
    {
      ...size,
      headers: { "Cache-Control": "public, max-age=300" },
    },
  );
}
