import { describe, expect, it } from "vitest";
import {
  parseAsaasEvent,
  subscriptionIdOf,
  tokenMatches,
} from "./asaas-webhook";

const payment = JSON.stringify({
  id: "evt_05b708f961d739ea7eba7e4db318f621&368604920",
  event: "PAYMENT_RECEIVED",
  dateCreated: "2024-06-12 16:45:03",
  payment: {
    object: "payment",
    id: "pay_080225913252",
    customer: "cus_G7Dvo4iphUNk",
    subscription: "sub_VXJBYgP2u0eO",
    dueDate: "2021-01-01",
    billingType: "PIX",
    campoNovo: { qualquer: true },
  },
});

describe("webhook do Asaas", () => {
  it("lê evento de cobrança e aceita campos novos", () => {
    const event = parseAsaasEvent(payment);
    expect(event?.event).toBe("PAYMENT_RECEIVED");
    expect(event && subscriptionIdOf(event)).toBe("sub_VXJBYgP2u0eO");
  });

  it("lê evento de assinatura", () => {
    const event = parseAsaasEvent(
      JSON.stringify({
        id: "evt_1",
        event: "SUBSCRIPTION_DELETED",
        subscription: { id: "sub_m5gdy1upm25fbwgx", status: "INACTIVE" },
      }),
    );
    expect(event && subscriptionIdOf(event)).toBe("sub_m5gdy1upm25fbwgx");
  });

  it("cobrança avulsa não tem assinatura", () => {
    const event = parseAsaasEvent(
      JSON.stringify({
        id: "evt_2",
        event: "PAYMENT_RECEIVED",
        payment: { id: "pay_1", dueDate: "2027-01-01" },
      }),
    );
    expect(event && subscriptionIdOf(event)).toBe(null);
  });

  it("recusa corpo inválido", () => {
    expect(parseAsaasEvent("não é json")).toBe(null);
    expect(parseAsaasEvent(JSON.stringify({ event: "PAYMENT_RECEIVED" }))).toBe(
      null,
    );
    expect(
      parseAsaasEvent(
        JSON.stringify({
          id: "evt_3",
          event: "PAYMENT_RECEIVED",
          payment: { id: "pay_1", dueDate: "ontem" },
        }),
      ),
    ).toBe(null);
  });

  it("confere o token do header", () => {
    expect(tokenMatches("segredo-123", "segredo-123")).toBe(true);
    expect(tokenMatches("segredo-124", "segredo-123")).toBe(false);
    expect(tokenMatches(null, "segredo-123")).toBe(false);
    expect(tokenMatches("", "")).toBe(false);
  });
});
