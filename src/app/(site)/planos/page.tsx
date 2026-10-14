import { getAccessStatus } from "@/lib/data/trial";
import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/home/Section";
import { PlanCards } from "@/components/plans/PlanCards";
import { WaitlistForm } from "@/components/plans/WaitlistForm";
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
  // Logado: a oferta do teste só aparece para quem ainda pode usar.
  const access =
    auth?.claims?.sub && typeof auth.claims.email === "string"
      ? await getAccessStatus({ id: auth.claims.sub, email: auth.claims.email })
      : null;
  const email =
    typeof auth?.claims?.email === "string" ? auth.claims.email : undefined;
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
                ? "Pague com Pix ou cartão na página segura do Asaas."
                : "Crie sua conta para continuar. Depois do cadastro, você volta para cá."}
            </p>
          </div>
          {isLoggedIn && (
            <Link
              href={`/checkout?plano=${chosen.id}`}
              className={buttonClasses("primary")}
            >
              Ir para o pagamento
            </Link>
          )}
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

      <PlanCards
        plans={plans}
        seatsLeft={seatsLeft}
        trialOffer={!access || (access.kind === "gratuito" && access.eligible)}
      />

      {seatsLeft <= 0 && (
        <section
          id="lista-de-espera"
          aria-labelledby="lista-de-espera-titulo"
          className="mx-auto flex w-full max-w-md scroll-mt-20 flex-col gap-4 rounded-card border border-border bg-surface p-6 text-center shadow-card"
        >
          <h2 id="lista-de-espera-titulo" className="text-lg font-semibold">
            Lista de espera do Intensivo
          </h2>
          <p className="text-[0.9375rem] text-muted">
            A turma está completa. Deixe seu e-mail e avisamos quando abrir
            vaga.
          </p>
          <WaitlistForm email={email} />
        </section>
      )}
    </div>
  );
}
