// Teste grátis de 30 dias do plano Membro (sem cartão, uma vez por conta).
// Datas no fuso de negócio (America/Sao_Paulo, sem horário de verão desde 2019).

import { todayInSaoPaulo } from "@/lib/format";

export const TRIAL_DAYS = 30;
export const TRIAL_PLAN = "membro";
const SP_OFFSET = "-03:00";
const DAY_MS = 24 * 60 * 60 * 1000;

// Soma dias a uma data "AAAA-MM-DD".
function addDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// O dia da ativação conta como o 1º dia. O teste vale até o fim (23h59 de
// Brasília) do 30º dia.
export function trialEndsAt(startedAt: Date): Date {
  const lastDay = addDays(todayInSaoPaulo(startedAt), TRIAL_DAYS - 1);
  return new Date(`${lastDay}T23:59:59.999${SP_OFFSET}`);
}

// Dias de teste que ainda restam, contando hoje (1 = último dia). 0 = acabou.
export function trialDaysLeft(endsAt: Date, now: Date = new Date()): number {
  if (now >= endsAt) return 0;
  const today = new Date(`${todayInSaoPaulo(now)}T12:00:00Z`).getTime();
  const last = new Date(`${todayInSaoPaulo(endsAt)}T12:00:00Z`).getTime();
  return Math.round((last - today) / DAY_MS) + 1;
}

// E-mail para conferir "uma vez por pessoa": minúsculas, sem "+etiqueta" e,
// no Gmail (que ignora pontos), sem pontos no nome.
export function normalizeEmail(email: string): string {
  const [rawLocal, rawDomain = ""] = email.trim().toLowerCase().split("@");
  let local = rawLocal.split("+")[0];
  let domain = rawDomain;
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replace(/\./g, "");
  return `${local}@${domain}`;
}

export type SubscriptionRow = {
  source: string;
  status: string;
  current_period_end: string | null;
};

// Já foi assinante: concessão manual, ou assinatura paga que chegou a ativar.
// Uma tentativa de pagamento abandonada (nunca ativou) não conta.
export function wasSubscriber(rows: SubscriptionRow[]): boolean {
  return rows.some(
    (row) =>
      row.source === "manual" ||
      (row.source === "asaas" &&
        (["active", "past_due"].includes(row.status) ||
          row.current_period_end !== null)),
  );
}

export type TrialAvoid = "ja-testou" | "ja-assinou";

// Quem pode começar o teste. `emailClaimed` = o e-mail normalizado já usou um teste.
export function trialBlocker(input: {
  rows: SubscriptionRow[];
  emailClaimed: boolean;
}): TrialAvoid | null {
  if (input.rows.some((row) => row.source === "trial") || input.emailClaimed)
    return "ja-testou";
  if (wasSubscriber(input.rows)) return "ja-assinou";
  return null;
}

export type AccessStatus =
  | { kind: "pago"; planRank: number }
  | { kind: "teste"; endsAt: Date; daysLeft: number }
  | { kind: "teste-expirado"; endsAt: Date }
  | { kind: "gratuito"; eligible: boolean; blocker: TrialAvoid | null };

// Situação de acesso para as telas. A decisão de acesso em si é do banco
// (my_plan_rank), que já inclui o teste e o expira pela data.
export function accessStatus(input: {
  paidRank: number;
  trial: { endsAt: Date; ended: boolean } | null;
  blocker: TrialAvoid | null;
  now?: Date;
}): AccessStatus {
  const now = input.now ?? new Date();
  if (input.paidRank > 0) return { kind: "pago", planRank: input.paidRank };
  if (input.trial) {
    const daysLeft = trialDaysLeft(input.trial.endsAt, now);
    if (!input.trial.ended && daysLeft > 0)
      return { kind: "teste", endsAt: input.trial.endsAt, daysLeft };
    return { kind: "teste-expirado", endsAt: input.trial.endsAt };
  }
  return {
    kind: "gratuito",
    eligible: input.blocker === null,
    blocker: input.blocker,
  };
}
