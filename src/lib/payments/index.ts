import "server-only";
import { asaas } from "./asaas";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  return asaas;
}

export function paymentsConfigured(): boolean {
  return Boolean(process.env.ASAAS_API_KEY);
}
