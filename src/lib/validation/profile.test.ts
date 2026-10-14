import { describe, expect, it } from "vitest";
import { plainText, profileSchema } from "./profile";

describe("plainText", () => {
  it("remove HTML e caracteres de controle", () => {
    expect(plainText(" <b>Oi</b><script>x</script>\u0007 ")).toBe("Oix");
    expect(plainText("Gosto de 1.e4 & finais")).toBe("Gosto de 1.e4 & finais");
  });
});

describe("profileSchema", () => {
  const base = { name: "Ana", bio: "", whatsapp: "", showInRanking: true };

  it("aceita dados válidos e guarda só os dígitos do WhatsApp", () => {
    const parsed = profileSchema.parse({
      ...base,
      whatsapp: "(51) 99999-9999",
    });
    expect(parsed.whatsapp).toBe("51999999999");
  });

  it("recusa bio longa e WhatsApp inválido", () => {
    expect(
      profileSchema.safeParse({ ...base, bio: "x".repeat(161) }).success,
    ).toBe(false);
    expect(profileSchema.safeParse({ ...base, whatsapp: "123" }).success).toBe(
      false,
    );
  });

  it("bio só com HTML vira vazia", () => {
    expect(profileSchema.parse({ ...base, bio: "<img src=x>" }).bio).toBe("");
  });
});
