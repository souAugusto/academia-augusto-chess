import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";
import { requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Aberturas" };

export default async function AberturasPage() {
  await requireUser("/aberturas");
  return (
    <ComingSoon
      section="aberturas"
      title="Aberturas"
      description="Repertórios em árvore, com comentário em cada lance e modo treino."
      phase="[MÓDULO DE ABERTURAS ENTRA NA FASE 3]"
    />
  );
}
