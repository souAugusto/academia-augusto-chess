import { describe, expect, it } from "vitest";
import { routeRedirect, safeNextPath } from "./routes";

describe("routeRedirect", () => {
  it("manda visitante da área do aluno para /entrar, guardando o destino", () => {
    expect(routeRedirect("/painel", "", false)).toBe("/entrar?next=%2Fpainel");
    expect(routeRedirect("/aulas/123", "?a=1", false)).toBe(
      "/entrar?next=%2Faulas%2F123%3Fa%3D1",
    );
  });

  it("protege os módulos da Finale", () => {
    for (const path of [
      "/taticas",
      "/aberturas/siciliana",
      "/finais",
      "/checkout",
    ]) {
      expect(routeRedirect(path, "", false)).toMatch(/^\/entrar\?next=/);
    }
  });

  it("deixa páginas públicas abertas", () => {
    for (const path of [
      "/",
      "/planos",
      "/termos",
      "/privacidade",
      "/puzzle-do-dia",
      "/entrar",
    ]) {
      expect(routeRedirect(path, "", false)).toBeNull();
    }
  });

  it("não confunde prefixos parecidos", () => {
    expect(routeRedirect("/painelzinho", "", false)).toBeNull();
  });

  it("tira quem já entrou da tela de login", () => {
    expect(routeRedirect("/entrar", "", true)).toBe("/painel");
  });

  it("deixa o aluno logado acessar a área dele", () => {
    expect(routeRedirect("/painel", "", true)).toBeNull();
  });
});

describe("safeNextPath", () => {
  it("aceita caminhos internos", () => {
    expect(safeNextPath("/planos", "/painel")).toBe("/planos");
  });

  it("recusa endereços externos", () => {
    for (const next of [
      "//evil.com",
      "https://evil.com",
      "/\\evil.com",
      "planos",
      "",
      null,
    ]) {
      expect(safeNextPath(next, "/painel")).toBe("/painel");
    }
  });
});
