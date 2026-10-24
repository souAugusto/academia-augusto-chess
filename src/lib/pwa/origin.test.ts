import { describe, expect, it } from "vitest";
import { nextOrigin, sanitizeOrigin } from "./origin";

describe("origem da visita", () => {
  it("aceita só identificadores simples", () => {
    expect(sanitizeOrigin("Instagram")).toBe("instagram");
    expect(sanitizeOrigin("qr")).toBe("qr");
    expect(sanitizeOrigin("bio_link-2")).toBe("bio_link-2");
    expect(sanitizeOrigin("")).toBeNull();
    expect(sanitizeOrigin(null)).toBeNull();
    expect(sanitizeOrigin("<script>")).toBeNull();
    expect(sanitizeOrigin("a".repeat(41))).toBeNull();
  });

  it("mantém a primeira origem e atualiza a última", () => {
    const first = nextOrigin(null, "qr", 1);
    expect(first).toEqual({ primeira: "qr", ultima: "qr", em: 1 });
    expect(nextOrigin(first, "instagram", 2)).toEqual({
      primeira: "qr",
      ultima: "instagram",
      em: 2,
    });
  });
});
