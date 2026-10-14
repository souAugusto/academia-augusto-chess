import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { PAYMENT_NOTE, PLAN_COPY } from "@/content/plans";
import {
  TRIAL_HREF,
  TRIAL_NOTE,
  TRIAL_PLAN_BADGE,
  TRIAL_PLAN_CTA,
} from "@/content/trial";
import type { Plan } from "@/lib/data/public";
import { formatPriceBRL } from "@/lib/format";

type PlanCardsProps = {
  plans: Plan[];
  seatsLeft: number;
  // Oferta do teste grátis no cartão do Membro. Desligada para quem já paga
  // ou já usou o teste (só a página /planos sabe quem está logado).
  trialOffer?: boolean;
};

// Os botões levam para /planos com o plano escolhido: lá a pessoa cria a conta
// ou segue para o pagamento.
function ctaHref(plan: Plan) {
  return `/planos?plano=${plan.id}`;
}

export function PlanCards({
  plans,
  seatsLeft,
  trialOffer = true,
}: PlanCardsProps) {
  return (
    <div className="grid items-stretch gap-6 md:grid-cols-2">
      {plans.map((plan) => {
        const copy = PLAN_COPY[plan.id];
        const featured = plan.id === "intensivo";
        const full = plan.seatLimit !== null && seatsLeft <= 0;
        const trial = trialOffer && plan.id === "membro";
        return (
          <article
            key={plan.id}
            aria-labelledby={`plano-${plan.id}`}
            className={`relative flex flex-col gap-6 rounded-panel border p-7 shadow-card sm:p-8 ${
              featured
                ? "border-accent bg-surface-2 bg-[radial-gradient(30rem_16rem_at_100%_0%,var(--glow),transparent_70%)]"
                : "border-border bg-surface"
            }`}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id={`plano-${plan.id}`} className="text-xl font-semibold">
                  {plan.name}
                </h3>
                {trial && (
                  <span className="rounded-full border border-accent px-3 py-1 text-xs font-semibold text-accent-text">
                    {TRIAL_PLAN_BADGE}
                  </span>
                )}
                {copy.badge && plan.seatLimit !== null && (
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-on-accent">
                    {copy.badge(plan.seatLimit)}
                  </span>
                )}
              </div>
              <span className="text-sm text-muted">{copy.tagline}</span>
            </div>

            <div className="flex items-baseline gap-1.5">
              {trial && <span className="text-muted">depois</span>}
              <span className="font-display text-5xl font-semibold tracking-tight">
                {formatPriceBRL(plan.priceCents)}
              </span>
              <span className="text-muted">/mês</span>
            </div>

            {plan.seatLimit !== null && (
              <p
                className="text-sm font-semibold text-accent-text"
                aria-live="polite"
              >
                {full
                  ? "Turma completa no momento"
                  : `Restam ${seatsLeft} de ${plan.seatLimit} vagas`}
              </p>
            )}

            <ul className="flex grow flex-col gap-3 text-[0.9375rem] leading-normal">
              {copy.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <IconCheck className="mt-0.5 size-5 shrink-0 text-accent-text" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3">
              {full ? (
                <Link
                  href="/planos#lista-de-espera"
                  className={buttonClasses("outline-accent", "lg")}
                >
                  Entrar na lista de espera
                </Link>
              ) : trial ? (
                <>
                  <Link
                    href={TRIAL_HREF}
                    className={buttonClasses("outline-accent", "lg")}
                  >
                    {TRIAL_PLAN_CTA}
                  </Link>
                  <span className="text-center text-sm text-muted">
                    {TRIAL_NOTE}{" "}
                    <Link
                      href={ctaHref(plan)}
                      className="font-semibold text-accent-text underline-offset-4 hover:underline"
                    >
                      Ou assinar agora
                    </Link>
                  </span>
                </>
              ) : (
                <Link
                  href={ctaHref(plan)}
                  className={buttonClasses(
                    featured ? "primary" : "outline-accent",
                    "lg",
                  )}
                >
                  {copy.cta}
                </Link>
              )}
              <span className="text-center text-xs text-muted">
                {PAYMENT_NOTE}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
