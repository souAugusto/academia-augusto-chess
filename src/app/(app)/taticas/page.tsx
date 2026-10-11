import type { Metadata } from "next";
import { PlanRequired } from "@/components/app/PlanRequired";
import { TacticsTrainer } from "@/components/tactics/TacticsTrainer";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getMyTacticStats } from "@/lib/data/tactics";

export const metadata: Metadata = { title: "Táticas" };

export default async function TaticasPage() {
  const user = await requireUser("/taticas");
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Táticas"
        text="O treino de táticas, com rating, filtros por tema e revisão dos erros, faz parte da assinatura."
      />
    );
  }

  const stats = await getMyTacticStats();
  return (
    <TacticsTrainer
      initialRating={stats.rating}
      initialSolved={stats.solved}
      title={
        <>
          <SectionLabel>Treino</SectionLabel>
          <h1 className="font-display text-page font-semibold tracking-tight">
            Táticas
          </h1>
        </>
      }
    />
  );
}
