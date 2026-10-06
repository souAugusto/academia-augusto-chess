import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { PAYMENT_NOTE, PLAN_COPY } from "@/content/plans";
import type { Plan } from "@/lib/data/public";
import { formatPriceBRL } from "@/lib/format";

type PlanCardsProps = {
  plans: Plan[];
  seatsLeft: number;
};

// Até a Fase 3 (checkout), os botões levam para /planos.
function ctaHref(plan: Plan) {
  return `/planos?plano=${plan.id}`;
}

export function PlanCards({ plans, seatsLeft }: PlanCardsProps) {
  return (
    <div className="flex flex-wrap items-stretch gap-6">
      {plans.map((plan) => {
        const copy = PLAN_COPY[plan.id];
        const featured = plan.id === "intensivo";
        const full = plan.seatLimit !== null && seatsLeft <= 0;
        return (
          <article
            key={plan.id}
            aria-labelledby={`plano-${plan.id}`}
            className={`flex min-w-0 flex-[1_1_340px] flex-col gap-5 rounded-plano p-7 sm:p-9 ${
              featured
                ? "border-2 border-dourado bg-superficie-alta"
                : "border border-borda bg-superficie"
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id={`plano-${plan.id}`} className="text-xl font-bold">
                  {plan.name}
                </h3>
                {copy.badge && plan.seatLimit !== null && (
                  <span className="rounded-full bg-dourado px-3 py-1 text-xs font-bold text-sobre-dourado">
                    {copy.badge(plan.seatLimit)}
                  </span>
                )}
              </div>
              <span
                className={`text-sm ${featured ? "text-texto-secundario" : "text-texto-discreto"}`}
              >
                {copy.tagline}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-titulo text-preco font-bold">
                {formatPriceBRL(plan.priceCents)}
              </span>
              <span className="text-texto-secundario">/mês</span>
            </div>

            {plan.seatLimit !== null && (
              <p
                className="text-sm font-semibold text-dourado"
                aria-live="polite"
              >
                {full
                  ? "Turma completa no momento"
                  : `Restam ${seatsLeft} de ${plan.seatLimit} vagas`}
              </p>
            )}

            <ul className="flex grow flex-col gap-3 text-[0.9375rem] leading-normal">
              {copy.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>

            {full ? (
              <Link
                href="/planos#lista-de-espera"
                className={buttonClasses("contorno-dourado", "lg")}
              >
                Entrar na lista de espera
              </Link>
            ) : (
              <Link
                href={ctaHref(plan)}
                className={buttonClasses(
                  featured ? "primario" : "contorno-dourado",
                  "lg",
                )}
              >
                {copy.cta}
              </Link>
            )}
            <span className="text-center text-[0.8125rem] text-texto-discreto">
              {PAYMENT_NOTE}
            </span>
          </article>
        );
      })}
    </div>
  );
}
