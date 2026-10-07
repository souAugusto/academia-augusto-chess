import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";
import { requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Aulas" };

export default async function AulasPage() {
  await requireUser("/aulas");
  return (
    <ComingSoon
      section="aulas"
      title="Aulas em vídeo"
      description="Cursos em módulos, com o tabuleiro acompanhando o vídeo e material em PDF e PGN."
      phase="[MÓDULO DE AULAS ENTRA NA FASE 2]"
    />
  );
}
