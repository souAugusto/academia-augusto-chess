import type { Metadata } from "next";
import Link from "next/link";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Painel · Academia Augusto Chess" };

// Painel básico da Fase 1. Sequência, rating, revisão e aulas entram na Fase 2.
export default async function PainelPage({
  searchParams,
}: PageProps<"/painel">) {
  const [user, params] = await Promise.all([
    requireUser("/painel"),
    searchParams,
  ]);
  const plan = PLAN_NAMES[user.planRank];

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Eyebrow>Painel</Eyebrow>
        <h1 className="font-titulo text-pagina font-bold">Olá, {user.name}</h1>
      </div>

      {params.senha === "alterada" && (
        <FormAlert tone="sucesso">Sua senha foi alterada.</FormAlert>
      )}

      {plan ? (
        <section className="rounded-card border border-borda bg-superficie p-6">
          <p className="text-texto-secundario">
            Seu plano: <strong className="text-texto">{plan}</strong>
          </p>
        </section>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-5 rounded-card border border-dourado bg-superficie-alta p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold">
              Escolha seu plano para começar
            </h2>
            <p className="text-[0.9375rem] text-texto-secundario">
              Sua conta está pronta. Os treinos, as aulas e a comunidade abrem
              com a assinatura.
            </p>
          </div>
          <Link href="/planos" className={buttonClasses("primario")}>
            Ver planos
          </Link>
        </section>
      )}
    </>
  );
}
