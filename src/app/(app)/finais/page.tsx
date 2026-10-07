import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";
import { requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Finais" };

export default async function FinaisPage() {
  await requireUser("/finais");
  return (
    <ComingSoon
      section="finais"
      title="Finais"
      description="Posições clássicas por nível, para treinar a conversão e a defesa contra o computador."
      phase="[MÓDULO DE FINAIS ENTRA NA FASE 3]"
    />
  );
}
