import { describe, expect, it } from "vitest";
import {
  fieldErrors,
  loginSchema,
  newPasswordSchema,
  normalizeWhatsapp,
  signupSchema,
} from "./auth";

const valid = {
  name: "Ana",
  email: "  Ana@Email.com ",
  whatsapp: "",
  password: "senhaforte",
  terms: "on",
};

describe("signupSchema", () => {
  it("normaliza e-mail e aceita WhatsApp vazio", () => {
    const result = signupSchema.parse(valid);
    expect(result.email).toBe("ana@email.com");
    expect(result.whatsapp).toBeUndefined();
  });

  it("guarda só os dígitos do WhatsApp", () => {
    expect(
      signupSchema.parse({ ...valid, whatsapp: "(51) 99999-0000" }).whatsapp,
    ).toBe("51999990000");
    expect(
      signupSchema.parse({ ...valid, whatsapp: "+55 51 99999-0000" }).whatsapp,
    ).toBe("5551999990000");
  });

  it("recusa WhatsApp sem DDD", () => {
    const result = signupSchema.safeParse({ ...valid, whatsapp: "99999-0000" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).whatsapp).toContain("DDD");
  });

  it("exige o aceite dos termos", () => {
    const result = signupSchema.safeParse({ ...valid, terms: undefined });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).terms).toContain("aceite");
  });

  it("exige senha de 8 caracteres", () => {
    const result = signupSchema.safeParse({ ...valid, password: "curta" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).password).toContain("8");
  });
});

describe("loginSchema", () => {
  it("recusa e-mail inválido", () => {
    const result = loginSchema.safeParse({ email: "ana", password: "x" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).email).toBe("Digite um e-mail válido.");
  });
});

describe("newPasswordSchema", () => {
  it("exige confirmação igual", () => {
    const result = newPasswordSchema.safeParse({
      password: "senhaforte",
      confirm: "outra123",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(fieldErrors(result.error).confirm).toBe(
        "As senhas não são iguais.",
      );
  });
});

describe("normalizeWhatsapp", () => {
  it("retorna undefined para texto sem dígitos", () => {
    expect(normalizeWhatsapp("  ")).toBeUndefined();
  });
});
