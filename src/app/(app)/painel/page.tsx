import type { Metadata } from "next";
import Link from "next/link";
import { APP_SECTIONS } from "@/components/app/modules";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Painel" };

// Painel da Fundação. Rating, sequência, revisão e trilhas entram nas fases 2 e 5.
export default async function PainelPage({
  searchParams,
}: PageProps<"/painel">) {
  const [user, params] = await Promise.all([
    requireUser("/painel"),
    searchParams,
  ]);
  const plan = PLAN_NAMES[user.planRank];
  const areas = APP_SECTIONS.filter((section) => section.id !== "painel");

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Olá, {user.name}
        </h1>
      </div>

      {params.senha === "alterada" && (
        <FormAlert tone="sucesso">Sua senha foi alterada.</FormAlert>
      )}

      {plan ? (
        <p className="text-muted">
          Seu plano: <strong className="text-text">{plan}</strong>
        </p>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-accent bg-surface-2 p-6 shadow-card">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">
              Escolha seu plano para começar
            </h2>
            <p className="text-[0.9375rem] text-muted">
              Sua conta está pronta. O treino abre com a assinatura.
            </p>
          </div>
          <Link href="/planos" className={buttonClasses("primary")}>
            Ver planos
          </Link>
        </section>
      )}

      <section aria-labelledby="areas" className="flex flex-col gap-4">
        <h2 id="areas" className="text-lg font-semibold">
          Áreas de treino
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {areas.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-card transition hover:border-border-strong"
              >
                <span className="flex size-10 items-center justify-center rounded-control bg-surface-2 text-accent-text">
                  <Icon />
                </span>
                <span className="font-semibold">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
