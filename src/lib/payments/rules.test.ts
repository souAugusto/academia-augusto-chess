import { describe, expect, it } from "vitest";
import {
  addMonths,
  applyPaymentEvent,
  applySubscriptionEvent,
  periodEndFor,
  todayInSaoPaulo,
  type SubscriptionState,
} from "./rules";

const pending: SubscriptionState = {
  status: "incomplete",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

describe("datas", () => {
  it("usa o dia de São Paulo, não o UTC", () => {
    // 01:30 UTC de 15/03 ainda é 14/03 em Brasília.
    expect(todayInSaoPaulo(new Date("2027-03-15T01:30:00Z"))).toBe(
      "2027-03-14",
    );
  });

  it("soma meses respeitando o fim do mês", () => {
    expect(addMonths("2027-01-15", 1)).toBe("2027-02-15");
    expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
    expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
    expect(addMonths("2027-12-10", 1)).toBe("2028-01-10");
  });

  it("período pago vai até o fim do dia, um mês depois do vencimento", () => {
    expect(periodEndFor("2027-01-15")).toBe("2027-02-16T02:59:59.000Z");
  });
});

describe("eventos de cobrança", () => {
  it("pagamento confirmado ativa e define o fim do período", () => {
    expect(
      applyPaymentEvent(pending, "PAYMENT_RECEIVED", "2027-01-15"),
    ).toEqual({
      status: "active",
      currentPeriodEnd: "2027-02-16T02:59:59.000Z",
    });
  });

  it("CONFIRMED e depois RECEIVED da mesma cobrança não mudam nada", () => {
    const active = {
      ...pending,
      status: "active" as const,
      currentPeriodEnd: "2027-02-16T02:59:59.000Z",
    };
    expect(applyPaymentEvent(active, "PAYMENT_RECEIVED", "2027-01-15")).toBe(
      null,
    );
  });

  it("renovação estende o período; evento atrasado não encurta", () => {
    const active = {
      ...pending,
      status: "active" as const,
      currentPeriodEnd: "2027-02-16T02:59:59.000Z",
    };
    expect(
      applyPaymentEvent(active, "PAYMENT_CONFIRMED", "2027-02-15")
        ?.currentPeriodEnd,
    ).toBe("2027-03-16T02:59:59.000Z");
    const renewed = { ...active, currentPeriodEnd: "2027-03-16T02:59:59.000Z" };
    expect(applyPaymentEvent(renewed, "PAYMENT_CONFIRMED", "2027-01-15")).toBe(
      null,
    );
  });

  it("vencida: renovação vira atraso; primeira cobrança segue pendente", () => {
    expect(
      applyPaymentEvent(
        { ...pending, status: "active" },
        "PAYMENT_OVERDUE",
        "2027-02-15",
      ),
    ).toEqual({ status: "past_due" });
    expect(applyPaymentEvent(pending, "PAYMENT_OVERDUE", "2027-02-15")).toBe(
      null,
    );
  });

  it("pagamento em atraso que é pago volta a ativo", () => {
    expect(
      applyPaymentEvent(
        {
          ...pending,
          status: "past_due",
          currentPeriodEnd: "2027-02-16T02:59:59.000Z",
        },
        "PAYMENT_RECEIVED",
        "2027-02-15",
      ),
    ).toEqual({
      status: "active",
      currentPeriodEnd: "2027-03-16T02:59:59.000Z",
    });
  });

  it("estorno e chargeback encerram o acesso na hora", () => {
    const now = new Date("2027-01-20T12:00:00Z");
    expect(
      applyPaymentEvent(
        { ...pending, status: "active" },
        "PAYMENT_REFUNDED",
        "2027-01-15",
        now,
      ),
    ).toEqual({ status: "canceled", currentPeriodEnd: now.toISOString() });
  });

  it("ignora eventos sem efeito no acesso", () => {
    expect(applyPaymentEvent(pending, "PAYMENT_CREATED", "2027-01-15")).toBe(
      null,
    );
  });
});

describe("eventos de assinatura", () => {
  it("removida antes de pagar: cancelada", () => {
    expect(applySubscriptionEvent(pending, "SUBSCRIPTION_DELETED")).toEqual({
      status: "canceled",
    });
  });

  it("removida depois de pagar: acesso até o fim do período", () => {
    expect(
      applySubscriptionEvent(
        { ...pending, status: "active" },
        "SUBSCRIPTION_DELETED",
      ),
    ).toEqual({ cancelAtPeriodEnd: true });
    expect(
      applySubscriptionEvent(
        { ...pending, status: "active", cancelAtPeriodEnd: true },
        "SUBSCRIPTION_INACTIVATED",
      ),
    ).toBe(null);
  });

  it("ignora outros eventos", () => {
    expect(applySubscriptionEvent(pending, "SUBSCRIPTION_UPDATED")).toBe(null);
  });
});
