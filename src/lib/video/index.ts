// Interface de vídeo das aulas. O provedor fica guardado em lessons.video_provider,
// então dá para trocar YouTube por Bunny/Mux sem mudar as telas.
// YouTube não listado não protege o conteúdo: quem tiver o link assiste.

export type VideoProvider = "youtube" | "bunny" | "mux";

export type VideoEmbed = { src: string; allow: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// Aceita o ID puro ou um link do YouTube colado pelo admin.
export function youtubeId(value: string): string | null {
  const text = value.trim();
  if (YOUTUBE_ID.test(text)) return text;
  try {
    const url = new URL(text);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    const candidate =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : host === "youtube.com" || host === "youtube-nocookie.com"
          ? (url.searchParams.get("v") ??
            url.pathname.split("/").filter(Boolean).at(-1) ??
            "")
          : "";
    return YOUTUBE_ID.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function videoEmbed(
  provider: string,
  videoId: string | null,
): VideoEmbed | null {
  if (!videoId) return null;
  if (provider === "youtube") {
    const id = youtubeId(videoId);
    if (!id) return null;
    return {
      // Domínio sem cookies do YouTube; sem vídeos relacionados de outros canais.
      src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    };
  }
  // Bunny e Mux entram quando o provedor for contratado (URLs assinadas no servidor).
  return null;
}
