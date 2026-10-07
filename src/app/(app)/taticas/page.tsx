import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";
import { requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Táticas" };

export default async function TaticasPage() {
  await requireUser("/taticas");
  return (
    <ComingSoon
      section="taticas"
      title="Táticas"
      description="Puzzles por tema e dificuldade, com rating, dica, solução e revisão dos erros."
      phase="[MÓDULO DE TÁTICAS ENTRA NA FASE 2]"
    />
  );
}
