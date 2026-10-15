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
  successUrl?: string; // volta depois de pagar (só no checkout)
};

// Uma cobrança da assinatura, para o histórico em Minha conta.
export type PaymentRecord = {
  id: string;
  status: string; // PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED...
  dueDate: string; // AAAA-MM-DD
  paidDate: string | null;
  valueCents: number;
  method: BillingMethod | null;
  invoiceUrl: string | null; // página da cobrança (pagar ou ver)
  receiptUrl: string | null; // comprovante, depois de pago
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
  // Valor mensal da assinatura no provedor (vale também para as já canceladas).
  subscriptionValueCents(subscriptionId: string): Promise<number | null>;
  // Cobranças da assinatura, da mais recente para a mais antiga.
  listPayments(subscriptionId: string): Promise<PaymentRecord[]>;
  // Troca a forma de pagamento das próximas cobranças (e das em aberto).
  updateBillingType(
    subscriptionId: string,
    method: BillingMethod,
  ): Promise<void>;
}

export class PaymentError extends Error {}
