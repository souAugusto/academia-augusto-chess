export { todayInSaoPaulo } from "../format";

// Regras da assinatura que não dependem do provedor: período pago e mudanças de status.

export type SubscriptionStatus =
  | "incomplete" // criada, esperando o primeiro pagamento
  | "active"
  | "past_due" // cobrança vencida: acesso segue por 3 dias após o fim do período
  | "canceled";

export type SubscriptionState = {
  status: SubscriptionStatus;
  currentPeriodEnd: string | null; // ISO
  cancelAtPeriodEnd: boolean;
};

export type SubscriptionPatch = Partial<SubscriptionState>;

// Soma meses numa data "AAAA-MM-DD"; 31/01 + 1 mês vira 28/02 (ou 29/02).
export function addMonths(date: string, months: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

// Uma cobrança paga com vencimento em D libera o acesso até o fim do dia D + 1 mês
// (horário de Brasília, que não tem horário de verão desde 2019).
export function periodEndFor(dueDate: string): string {
  return new Date(`${addMonths(dueDate, 1)}T23:59:59-03:00`).toISOString();
}

function later(a: string | null, b: string): string {
  if (!a) return b;
  return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

// Eventos de cobrança. Retorna null quando não há nada a mudar.
export function applyPaymentEvent(
  state: SubscriptionState,
  event: string,
  dueDate: string,
  now: Date = new Date(),
): SubscriptionPatch | null {
  switch (event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED": {
      const end = later(state.currentPeriodEnd, periodEndFor(dueDate));
      if (state.status === "active" && end === state.currentPeriodEnd)
        return null; // cartão: RECEIVED chega depois do CONFIRMED
      return { status: "active", currentPeriodEnd: end };
    }
    case "PAYMENT_OVERDUE":
      // Primeira cobrança nunca paga continua "incomplete"; renovação vira atraso.
      return state.status === "active" ? { status: "past_due" } : null;
    case "PAYMENT_REFUNDED":
    case "PAYMENT_CHARGEBACK_REQUESTED":
      return { status: "canceled", currentPeriodEnd: now.toISOString() };
    default:
      return null;
  }
}

// Assinatura removida ou inativada (pelo aluno no site ou no painel do Asaas):
// quem já pagou mantém o acesso até o fim do período.
export function applySubscriptionEvent(
  state: SubscriptionState,
  event: string,
): SubscriptionPatch | null {
  if (event !== "SUBSCRIPTION_DELETED" && event !== "SUBSCRIPTION_INACTIVATED")
    return null;
  if (state.status === "incomplete") return { status: "canceled" };
  if (state.status === "canceled" || state.cancelAtPeriodEnd) return null;
  return { cancelAtPeriodEnd: true };
}
