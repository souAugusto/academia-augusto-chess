import { describe, expect, it } from "vitest";
import {
  passwordChangeSchema,
  passwordStrength,
  plainText,
  profileSchema,
} from "./profile";

describe("plainText", () => {
  it("remove HTML e caracteres de controle", () => {
    expect(plainText(" <b>Oi</b><script>x</script>\u0007 ")).toBe("Oix");
    expect(plainText("Gosto de 1.e4 & finais")).toBe("Gosto de 1.e4 & finais");
  });
});

describe("profileSchema", () => {
  const base = {
    name: "Ana",
    bio: "",
    whatsapp: "",
    location: "",
    declaredRating: "",
    showInRanking: true,
  };

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

describe("campos opcionais do perfil", () => {
  const base = { name: "Ana", bio: "", whatsapp: "", showInRanking: true };
  it("vazio vira nulo; rating e cidade válidos passam", () => {
    const parsed = profileSchema.parse({
      ...base,
      location: "",
      declaredRating: "",
    });
    expect(parsed.declaredRating).toBeNull();
    expect(
      profileSchema.parse({
        ...base,
        location: "Porto Alegre, RS",
        declaredRating: "1500",
      }).declaredRating,
    ).toBe(1500);
  });
  it("mensagens específicas para rating inválido", () => {
    const bad = profileSchema.safeParse({
      ...base,
      location: "",
      declaredRating: "abc",
    });
    expect(bad.success).toBe(false);
    const low = profileSchema.safeParse({
      ...base,
      location: "",
      declaredRating: "50",
    });
    expect(low.error?.issues[0].message).toContain("100 a 3500");
  });
});

describe("senha", () => {
  it("força cresce com tamanho e variedade", () => {
    expect(passwordStrength("abc")).toBe(0);
    expect(passwordStrength("abcdefgh")).toBe(1);
    expect(passwordStrength("Abcdefgh1234!xyz")).toBe(4);
  });
  it("confere confirmação e senha diferente da atual", () => {
    expect(
      passwordChangeSchema.safeParse({
        current: "velha123",
        password: "nova12345",
        confirm: "outra",
      }).success,
    ).toBe(false);
    expect(
      passwordChangeSchema.safeParse({
        current: "mesma1234",
        password: "mesma1234",
        confirm: "mesma1234",
      }).success,
    ).toBe(false);
    expect(
      passwordChangeSchema.safeParse({
        current: "velha123",
        password: "nova12345",
        confirm: "nova12345",
      }).success,
    ).toBe(true);
  });
});
