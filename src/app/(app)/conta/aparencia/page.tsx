import type { Metadata } from "next";
import Link from "next/link";
import { AppearancePanel } from "@/components/preferences/AppearancePanel";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Aparência" };

export default async function AparenciaPage() {
  await requireUser("/conta/aparencia");
  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/conta" className="text-sm text-muted hover:text-text">
          ← Minha conta
        </Link>
        <SectionLabel>Conta</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Aparência
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Escolha o tabuleiro, as peças e os sons. Vale para todos os tabuleiros
          do site e fica salvo na sua conta, em qualquer aparelho.
        </p>
      </div>
      <AppearancePanel />
    </>
  );
}
