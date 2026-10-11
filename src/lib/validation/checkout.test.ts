import { describe, expect, it } from "vitest";
import { checkoutSchema, waitlistSchema } from "./checkout";

describe("checkoutSchema", () => {
  it("aceita plano, forma de pagamento e CPF, guardando só os dígitos", () => {
    expect(
      checkoutSchema.parse({
        plan: "membro",
        method: "PIX",
        cpf: "529.982.247-25",
      }),
    ).toEqual({ plan: "membro", method: "PIX", cpf: "52998224725" });
  });

  it("recusa plano inexistente, forma desconhecida e CPF inválido", () => {
    const result = checkoutSchema.safeParse({
      plan: "gratis",
      method: "BOLETO",
      cpf: "123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual([
      "plan",
      "method",
      "cpf",
    ]);
  });
});

describe("waitlistSchema", () => {
  it("normaliza o e-mail", () => {
    expect(waitlistSchema.parse({ email: " Ana@Email.com " }).email).toBe(
      "ana@email.com",
    );
    expect(waitlistSchema.safeParse({ email: "ana" }).success).toBe(false);
  });
});
