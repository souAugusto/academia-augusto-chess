import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getIntensivoSeatsLeft, getPlans } from "@/lib/data/public";
import { formatPriceBRL } from "@/lib/format";
import { paymentsConfigured } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Assinatura" };

const PLAN_RANK: Record<string, number> = { membro: 1, intensivo: 2 };

// Quem já reservou a vaga (checkout aberto há pouco) pode continuar mesmo com a turma cheia.
async function hasSeatReservation(userId: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("seat_reservations")
    .select("user_id")
    .eq("user_id", userId)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return Boolean(data);
}

export default async function CheckoutPage({
  searchParams,
}: PageProps<"/checkout">) {
  const { plano } = await searchParams;
  const planId = typeof plano === "string" ? plano : "";
  const user = await requireUser(
    `/checkout?plano=${encodeURIComponent(planId)}`,
  );
  const [plans, seatsLeft] = await Promise.all([
    getPlans(),
    getIntensivoSeatsLeft(),
  ]);
  const plan = plans.find((item) => item.id === planId);

  let blocker: string | null = null;
  if (!plan) blocker = "Escolha um plano para continuar.";
  else if (user.planRank >= PLAN_RANK[plan.id])
    blocker = `Sua conta já tem o plano ${plan.name} ou superior.`;
  else if (
    plan.seatLimit !== null &&
    seatsLeft <= 0 &&
    !(await hasSeatReservation(user.id))
  )
    blocker =
      "A turma do Intensivo está completa no momento. Entre na lista de espera e avisamos quando abrir vaga.";
  else if (!paymentsConfigured())
    blocker = "O pagamento ainda está sendo configurado. Volte em breve.";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/planos" className="text-sm text-muted hover:text-text">
          ← Planos
        </Link>
        <SectionLabel>Assinatura</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {plan ? `Plano ${plan.name}` : "Assinatura"}
        </h1>
        {plan && (
          <p className="text-muted">
            {formatPriceBRL(plan.priceCents)} por mês. Sem fidelidade: ao
            cancelar, o acesso continua até o fim do mês pago.
          </p>
        )}
      </div>
      <Card className="flex flex-col gap-5 p-6 sm:p-8" highlight>
        {blocker || !plan ? (
          <>
            <p className="leading-relaxed text-muted">{blocker}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/planos#lista-de-espera"
                className={buttonClasses("primary")}
              >
                Ver planos
              </Link>
              <Link href="/conta" className={buttonClasses("secondary")}>
                Minha conta
              </Link>
            </div>
          </>
        ) : (
          <CheckoutForm planId={plan.id} />
        )}
      </Card>
    </div>
  );
}
