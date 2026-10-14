import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { IconCheck } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_COPY } from "@/content/plans";
import { TRIAL_NOTE, TRIAL_REASONS } from "@/content/trial";
import { requireUser } from "@/lib/data/account";
import { getAccessStatus } from "@/lib/data/trial";
import { formatLongDate } from "@/lib/format";
import { startTrial } from "./actions";

export const metadata: Metadata = { title: "Teste grátis" };

function isReason(value: unknown): value is keyof typeof TRIAL_REASONS {
  return typeof value === "string" && value in TRIAL_REASONS;
}

export default async function TesteGratisPage({
  searchParams,
}: PageProps<"/teste-gratis">) {
  const [user, params] = await Promise.all([
    requireUser("/teste-gratis"),
    searchParams,
  ]);
  const status = await getAccessStatus({ id: user.id, email: user.email });
  const reason = isReason(params.motivo) ? params.motivo : null;

  const heading = (
    <div className="flex flex-col gap-2">
      <SectionLabel>Plano Membro</SectionLabel>
      <h1 className="font-display text-page font-semibold tracking-tight">
        30 dias grátis
      </h1>
    </div>
  );

  if (status.kind === "pago" || status.kind === "teste")
    return (
      <>
        {heading}
        <Card className="flex max-w-xl flex-col items-start gap-4 p-7">
          <p className="leading-relaxed text-muted">
            {status.kind === "pago"
              ? TRIAL_REASONS.pago
              : `Seu teste já está ativo até ${formatLongDate(status.endsAt)}.`}
          </p>
          <Link href="/painel" className={buttonClasses("primary")}>
            Ir para o painel
          </Link>
        </Card>
      </>
    );

  if (status.kind === "teste-expirado" || !status.eligible)
    return (
      <>
        {heading}
        <Card className="flex max-w-xl flex-col items-start gap-4 p-7">
          <p role="status" className="leading-relaxed text-muted">
            {
              TRIAL_REASONS[
                status.kind === "gratuito" && status.blocker
                  ? status.blocker
                  : reason && reason !== "erro"
                    ? reason
                    : "ja-testou"
              ]
            }
          </p>
          <Link
            href="/planos?plano=membro"
            className={buttonClasses("primary")}
          >
            Ver planos
          </Link>
        </Card>
      </>
    );

  return (
    <>
      {heading}
      <Card className="flex max-w-xl flex-col gap-5 p-7" highlight>
        <p className="leading-relaxed text-muted">
          Acesso completo ao plano Membro por 30 dias, a partir de agora. Ao
          fim, nada é cobrado: se quiser continuar, é só assinar.
        </p>
        <ul className="flex flex-col gap-3 text-[0.9375rem]">
          {PLAN_COPY.membro.features.map((feature) => (
            <li key={feature} className="flex gap-2.5">
              <IconCheck className="mt-0.5 size-5 shrink-0 text-accent-text" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {reason === "erro" && (
          <p role="alert" className="text-sm text-danger">
            {TRIAL_REASONS.erro}
          </p>
        )}
        <form action={startTrial} className="flex flex-col gap-2">
          <button type="submit" className={buttonClasses("primary", "lg")}>
            Ativar meus 30 dias grátis
          </button>
          <span className="text-center text-sm text-muted">
            {TRIAL_NOTE} Vale uma vez por conta.
          </span>
        </form>
      </Card>
    </>
  );
}
