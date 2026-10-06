import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/Section";
import { PlanCards } from "@/components/plans/PlanCards";
import { buttonClasses } from "@/components/ui/button";
import { PLANS_SECTION } from "@/content/home";
import { getIntensivoSeatsLeft, getPlans } from "@/lib/data/public";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Planos · Academia Augusto Chess" };

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
    <div className="mx-auto flex max-w-[1000px] flex-col gap-10 px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow={PLANS_SECTION.eyebrow}
        title={PLANS_SECTION.title}
        center
      />

      {chosen && (
        <section
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-dourado bg-superficie-alta p-6"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">
              Você escolheu o plano {chosen.name}
            </h2>
            <p className="text-[0.9375rem] text-texto-secundario">
              {isLoggedIn
                ? "[PAGAMENTO PELO STRIPE ENTRA NA FASE 3]"
                : "Crie sua conta para continuar. Depois do cadastro, você volta para cá."}
            </p>
          </div>
          {!isLoggedIn && (
            <Link
              href={`/entrar?aba=criar&next=${encodeURIComponent(nextHere)}`}
              className={buttonClasses("primario")}
            >
              Criar conta
            </Link>
          )}
        </section>
      )}

      <PlanCards plans={plans} seatsLeft={seatsLeft} />

      <section
        id="lista-de-espera"
        className="scroll-mt-4 text-center text-sm text-texto-discreto"
      >
        {seatsLeft <= 0 && "[LISTA DE ESPERA DO INTENSIVO ENTRA NA FASE 3]"}
      </section>
    </div>
  );
}
