import { describe, expect, it } from "vitest";
import { videoEmbed, youtubeId } from "./index";

describe("youtubeId", () => {
  it("aceita o ID puro e os formatos de link", () => {
    for (const value of [
      "dQw4w9WgXcQ",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ",
      "https://youtube.com/shorts/dQw4w9WgXcQ",
      "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10",
    ]) {
      expect(youtubeId(value)).toBe("dQw4w9WgXcQ");
    }
  });

  it("recusa outros sites e IDs inválidos", () => {
    expect(youtubeId("https://evil.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(youtubeId("abc")).toBeNull();
    expect(youtubeId('dQw4w9WgXc"')).toBeNull();
  });
});

describe("videoEmbed", () => {
  it("monta o player sem cookies do YouTube", () => {
    expect(videoEmbed("youtube", "dQw4w9WgXcQ")?.src).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    );
  });

  it("retorna null sem vídeo ou com provedor ainda não configurado", () => {
    expect(videoEmbed("youtube", null)).toBeNull();
    expect(videoEmbed("bunny", "abc")).toBeNull();
  });
});
