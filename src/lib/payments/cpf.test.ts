import { describe, expect, it } from "vitest";
import { isValidCpf, normalizeCpf } from "./cpf";

describe("CPF", () => {
  it("aceita CPF válido com ou sem pontuação", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("52998224725")).toBe(true);
  });

  it("recusa dígito errado, tamanho errado e sequência repetida", () => {
    expect(isValidCpf("529.982.247-26")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("")).toBe(false);
  });

  it("guarda só os dígitos", () => {
    expect(normalizeCpf(" 529.982.247-25 ")).toBe("52998224725");
  });
});
