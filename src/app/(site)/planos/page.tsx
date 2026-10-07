import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/Section";
import { PlanCards } from "@/components/plans/PlanCards";
import { buttonClasses } from "@/components/ui/button";
import { PLANS_SECTION } from "@/content/home";
import { getIntensivoSeatsLeft, getPlans } from "@/lib/data/public";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Planos" };

export default async function PlanosPage({
  searchParams,
}: PageProps<"/planos">) {
  const supabase = await createClient();
  const [plans, seatsLeft, params, { data: auth }] = await Promise.all([
    getPlans(),
    getIntensivoSeatsLeft(),
    searchParams,
    supabase.auth.getClaims(),
  ]);
  const isLoggedIn = Boolean(auth?.claims);
  const chosen = plans.find((plan) => plan.id === params.plano);
  const nextHere = `/planos?plano=${chosen?.id ?? ""}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-16 sm:px-6">
      <SectionHeading
        label={PLANS_SECTION.label}
        title={PLANS_SECTION.title}
        center
      />

      {chosen && (
        <section
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-accent bg-surface-2 p-6 shadow-card"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              Você escolheu o plano {chosen.name}
            </h2>
            <p className="text-[0.9375rem] text-muted">
              {isLoggedIn
                ? "[PAGAMENTO ENTRA NA FASE 4]"
                : "Crie sua conta para continuar. Depois do cadastro, você volta para cá."}
            </p>
          </div>
          {!isLoggedIn && (
            <Link
              href={`/entrar?aba=criar&next=${encodeURIComponent(nextHere)}`}
              className={buttonClasses("primary")}
            >
              Criar conta
            </Link>
          )}
        </section>
      )}

      <PlanCards plans={plans} seatsLeft={seatsLeft} />

      <section
        id="lista-de-espera"
        className="scroll-mt-20 text-center text-sm text-muted"
      >
        {seatsLeft <= 0 && "[LISTA DE ESPERA DO INTENSIVO ENTRA NA FASE 4]"}
      </section>
    </div>
  );
}
