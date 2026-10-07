import type { Metadata } from "next";
import Link from "next/link";
import { APP_SECTIONS } from "@/components/app/modules";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";
import { getMyTacticStats } from "@/lib/data/tactics";

export const metadata: Metadata = { title: "Painel" };

// Painel: rating de táticas (Fase 2). Sequência, revisão e trilhas entram na Fase 5.
export default async function PainelPage({
  searchParams,
}: PageProps<"/painel">) {
  const [user, params] = await Promise.all([
    requireUser("/painel"),
    searchParams,
  ]);
  const plan = PLAN_NAMES[user.planRank];
  const stats = plan ? await getMyTacticStats() : null;
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

      {plan && stats ? (
        <section className="flex flex-wrap items-end justify-between gap-5 rounded-card border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">Rating de táticas</span>
            <span className="font-display text-4xl font-semibold tabular-nums">
              {stats.rating}
            </span>
            <span className="text-sm text-muted">
              {stats.solved} puzzles resolvidos · plano {plan}
            </span>
          </div>
          <Link href="/taticas" className={buttonClasses("primary")}>
            Treinar táticas
          </Link>
        </section>
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
