import { describe, expect, it } from "vitest";
import { timeAgo } from "@/components/notifications/NotificationParts";
import {
  cleanText,
  endOfDaySaoPaulo,
  isSafeLink,
  MAX_BODY,
  notificationSchema,
} from "./notifications";

const base = {
  title: "Aula nova",
  body: "Saiu a aula de finais de torre.",
  kind: "novidade",
  link: "/aulas",
  audience: "todos",
  targetEmail: "",
  expiresOn: "",
};

describe("notificações: validação", () => {
  it("aceita uma notificação normal", () => {
    const parsed = notificationSchema.safeParse(base);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.link).toBe("/aulas");
  });

  it("links: só caminho do site ou https", () => {
    expect(isSafeLink("/aulas/finais")).toBe(true);
    expect(isSafeLink("https://youtube.com/x")).toBe(true);
    expect(isSafeLink("javascript:alert(1)")).toBe(false);
    expect(isSafeLink("http://site.com")).toBe(false);
    expect(isSafeLink("//site-malicioso.com")).toBe(false);
    expect(isSafeLink("data:text/html,<script>")).toBe(false);
    expect(notificationSchema.safeParse({ ...base, link: "javascript:alert(1)" }).success).toBe(false);
    expect(notificationSchema.safeParse({ ...base, link: "" }).data?.link).toBeNull();
  });

  it("limita o tamanho e exige título e mensagem", () => {
    expect(notificationSchema.safeParse({ ...base, body: "x".repeat(MAX_BODY + 1) }).success).toBe(false);
    expect(notificationSchema.safeParse({ ...base, title: "   " }).success).toBe(false);
  });

  it("texto fica puro: tira caracteres de controle, mantém quebras de linha", () => {
    expect(cleanText("Olá\u0000\u0007 aluno\r\n\r\n\r\n\r\nfim  ")).toBe("Olá aluno\n\nfim");
    // HTML não é removido nem interpretado: a tela mostra como texto.
    expect(cleanText("<b>oi</b>")).toBe("<b>oi</b>");
  });

  it("aluno específico exige e-mail válido", () => {
    expect(notificationSchema.safeParse({ ...base, audience: "usuario" }).success).toBe(false);
    const ok = notificationSchema.safeParse({ ...base, audience: "usuario", targetEmail: " Aluno@Exemplo.com " });
    expect(ok.success).toBe(true);
    expect(ok.data?.targetEmail).toBe("aluno@exemplo.com");
  });

  it("expiração vale até o fim do dia em Brasília", () => {
    expect(endOfDaySaoPaulo("2026-10-30")).toBe("2026-10-31T02:59:59.000Z");
    expect(notificationSchema.safeParse({ ...base, expiresOn: "30/10/2026" }).success).toBe(false);
  });

  it("tempo relativo em português", () => {
    const now = new Date("2026-10-22T12:00:00Z").getTime();
    expect(timeAgo("2026-10-22T11:59:40Z", now)).toBe("agora");
    expect(timeAgo("2026-10-22T11:30:00Z", now)).toBe("há 30 min");
    expect(timeAgo("2026-10-22T09:00:00Z", now)).toBe("há 3 h");
    expect(timeAgo("2026-10-21T12:00:00Z", now)).toBe("há 1 dia");
  });
});
