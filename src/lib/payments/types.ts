// Interface do provedor de pagamento. O resto do site só conhece isto.

export type BillingMethod = "PIX" | "CREDIT_CARD";

export type CustomerInput = {
  userId: string;
  name: string;
  email: string;
  cpf: string; // só dígitos
  mobilePhone?: string;
};

export type NewSubscription = {
  customerId: string;
  method: BillingMethod;
  valueCents: number;
  description: string;
  externalReference: string; // id da assinatura no nosso banco
  firstDueDate: string; // AAAA-MM-DD
  successUrl: string;
};

export interface PaymentProvider {
  readonly name: "asaas";
  // Cria o cliente ou atualiza o existente; devolve o id no provedor.
  saveCustomer(
    existingId: string | null,
    input: CustomerInput,
  ): Promise<string>;
  createSubscription(input: NewSubscription): Promise<{ id: string }>;
  // Página de pagamento da primeira cobrança em aberto (Pix ou cartão, no provedor).
  pendingInvoiceUrl(subscriptionId: string): Promise<string | null>;
  // Encerra a recorrência: nenhuma cobrança nova é gerada.
  cancelSubscription(subscriptionId: string): Promise<void>;
}

export class PaymentError extends Error {}
