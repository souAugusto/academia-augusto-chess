import { describe, expect, it } from "vitest";
import {
  accessStatus,
  normalizeEmail,
  trialBlocker,
  trialDaysLeft,
  trialEndsAt,
  wasSubscriber,
} from "./trial";

describe("trialEndsAt / trialDaysLeft", () => {
  // 14/10/2026 15h em Brasília (18h UTC)
  const start = new Date("2026-10-14T18:00:00Z");
  const end = trialEndsAt(start);

  it("vale até 23h59 de Brasília do 30º dia (o dia da ativação conta)", () => {
    expect(end.toISOString()).toBe("2026-11-13T02:59:59.999Z"); // 12/11 23:59:59 -03
  });

  it("ativação às 23h50 de Brasília ainda conta aquele dia", () => {
    const late = trialEndsAt(new Date("2026-10-15T02:50:00Z")); // 14/10 23h50 -03
    expect(late.toISOString()).toBe(end.toISOString());
  });

  it("conta 30 dias no início, 1 no último dia e 0 depois", () => {
    expect(trialDaysLeft(end, start)).toBe(30);
    expect(trialDaysLeft(end, new Date("2026-11-05T15:00:00Z"))).toBe(8);
    expect(trialDaysLeft(end, new Date("2026-11-12T20:00:00Z"))).toBe(1);
    expect(trialDaysLeft(end, new Date("2026-11-13T03:00:00Z"))).toBe(0);
  });

  it("31 dias depois da ativação, acabou", () => {
    const later = new Date(start.getTime() + 31 * 24 * 60 * 60 * 1000);
    expect(trialDaysLeft(end, later)).toBe(0);
  });
});

describe("normalizeEmail", () => {
  it("minúsculas, sem +etiqueta e sem pontos no Gmail", () => {
    expect(normalizeEmail(" Joao.Silva+teste@GMAIL.com ")).toBe(
      "joaosilva@gmail.com",
    );
    expect(normalizeEmail("j.o.a.o@googlemail.com")).toBe("joao@gmail.com");
    expect(normalizeEmail("ana.paula+x@empresa.com.br")).toBe(
      "ana.paula@empresa.com.br",
    );
  });
});

describe("elegibilidade", () => {
  const abandoned = {
    source: "asaas",
    status: "canceled",
    current_period_end: null,
  };
  const paid = {
    source: "asaas",
    status: "canceled",
    current_period_end: "2026-09-01T00:00:00Z",
  };
  const trial = {
    source: "trial",
    status: "trialing",
    current_period_end: "2026-11-13T02:59:59Z",
  };

  it("conta nova pode testar; pagamento abandonado não impede", () => {
    expect(trialBlocker({ rows: [], emailClaimed: false })).toBeNull();
    expect(trialBlocker({ rows: [abandoned], emailClaimed: false })).toBeNull();
  });
  it("quem já assinou (pago ou concedido) não testa", () => {
    expect(wasSubscriber([paid])).toBe(true);
    expect(trialBlocker({ rows: [paid], emailClaimed: false })).toBe(
      "ja-assinou",
    );
    expect(
      trialBlocker({
        rows: [
          { source: "manual", status: "active", current_period_end: null },
        ],
        emailClaimed: false,
      }),
    ).toBe("ja-assinou");
  });
  it("segundo teste: na mesma conta ou no mesmo e-mail", () => {
    expect(trialBlocker({ rows: [trial], emailClaimed: false })).toBe(
      "ja-testou",
    );
    expect(trialBlocker({ rows: [], emailClaimed: true })).toBe("ja-testou");
  });
});

describe("accessStatus", () => {
  const endsAt = new Date("2026-11-13T02:59:59.999Z");
  it("pagante vence o teste", () => {
    expect(
      accessStatus({
        paidRank: 1,
        trial: { endsAt, ended: false },
        blocker: null,
      }).kind,
    ).toBe("pago");
  });
  it("em teste, expirado e gratuito", () => {
    const now = new Date("2026-11-01T12:00:00Z");
    expect(
      accessStatus({
        paidRank: 0,
        trial: { endsAt, ended: false },
        blocker: null,
        now,
      }),
    ).toMatchObject({ kind: "teste", daysLeft: 12 });
    expect(
      accessStatus({
        paidRank: 0,
        trial: { endsAt, ended: false },
        blocker: null,
        now: new Date("2026-11-14T12:00:00Z"),
      }).kind,
    ).toBe("teste-expirado");
    expect(accessStatus({ paidRank: 0, trial: null, blocker: null })).toEqual({
      kind: "gratuito",
      eligible: true,
      blocker: null,
    });
  });
});
