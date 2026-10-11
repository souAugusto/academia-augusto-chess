import "server-only";
import {
  PaymentError,
  type CustomerInput,
  type NewSubscription,
  type PaymentProvider,
} from "./types";

// Cliente da API v3 do Asaas (https://docs.asaas.com). Só roda no servidor.
const SANDBOX_URL = "https://api-sandbox.asaas.com/v3";
const PRODUCTION_HOST = "api.asaas.com";

function config() {
  const apiKey = process.env.ASAAS_API_KEY;
  const baseUrl = process.env.ASAAS_API_URL || SANDBOX_URL;
  if (!apiKey) throw new PaymentError("Pagamento não configurado.");
  // Modo real só com confirmação explícita do Augusto (CLAUDE.md, regra 11).
  if (
    new URL(baseUrl).host === PRODUCTION_HOST &&
    process.env.PAYMENTS_LIVE !== "1"
  ) {
    throw new PaymentError("Pagamento real ainda não foi liberado.");
  }
  return { apiKey, baseUrl };
}

type AsaasErrorBody = { errors?: { description?: string }[] };

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const { apiKey, baseUrl } = config();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        access_token: apiKey,
        "Content-Type": "application/json",
        "User-Agent": "finale-xadrez",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
      cache: "no-store",
    });
  } catch {
    throw new PaymentError("Não foi possível falar com o Asaas.");
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const description = (data as AsaasErrorBody | null)?.errors?.[0]
      ?.description;
    console.error(
      `Asaas ${method} ${path}: HTTP ${response.status}`,
      description,
    );
    throw new PaymentError(description ?? "O Asaas recusou a operação.");
  }
  return data as T;
}

type AsaasPayment = {
  id: string;
  status: string;
  dueDate: string;
  invoiceUrl: string;
};

export const asaas: PaymentProvider = {
  name: "asaas",

  async saveCustomer(existingId: string | null, input: CustomerInput) {
    const body = {
      name: input.name,
      cpfCnpj: input.cpf,
      email: input.email,
      mobilePhone: input.mobilePhone,
      externalReference: input.userId,
    };
    if (existingId) {
      await request(
        "PUT",
        `/customers/${encodeURIComponent(existingId)}`,
        body,
      );
      return existingId;
    }
    const created = await request<{ id: string }>("POST", "/customers", body);
    return created.id;
  },

  async createSubscription(input: NewSubscription) {
    return request<{ id: string }>("POST", "/subscriptions", {
      customer: input.customerId,
      billingType: input.method,
      value: input.valueCents / 100,
      nextDueDate: input.firstDueDate,
      cycle: "MONTHLY",
      description: input.description,
      externalReference: input.externalReference,
      callback: { successUrl: input.successUrl, autoRedirect: true },
    });
  },

  async pendingInvoiceUrl(subscriptionId: string) {
    const list = await request<{ data: AsaasPayment[] }>(
      "GET",
      `/subscriptions/${encodeURIComponent(subscriptionId)}/payments`,
    );
    const open = list.data
      .filter(
        (payment) =>
          payment.status === "PENDING" || payment.status === "OVERDUE",
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return open[0]?.invoiceUrl ?? null;
  },

  async cancelSubscription(subscriptionId: string) {
    await request(
      "DELETE",
      `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    );
  },
};
