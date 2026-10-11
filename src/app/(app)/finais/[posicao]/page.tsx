import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanRequired } from "@/components/app/PlanRequired";
import { EndgameTrainer } from "@/components/endgames/EndgameTrainer";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getEndgame, LEVEL_LABELS } from "@/lib/data/endgames";

export const metadata: Metadata = { title: "Final" };

const SLUG = /^[a-z0-9-]{2,60}$/;

export default async function FinalPage({
  params,
}: PageProps<"/finais/[posicao]">) {
  const { posicao } = await params;
  const user = await requireUser(`/finais/${posicao}`);
  if (user.planRank < 1) {
    return (
      <PlanRequired title="Finais" text="Este final faz parte da assinatura." />
    );
  }
  if (!SLUG.test(posicao)) notFound();
  const endgame = await getEndgame(posicao);
  if (!endgame) notFound();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/finais" className="text-sm text-muted hover:text-text">
          ← Finais
        </Link>
        <SectionLabel>
          {endgame.category} ·{" "}
          {LEVEL_LABELS[endgame.level] ?? `Nível ${endgame.level}`}
        </SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {endgame.title}
        </h1>
        {endgame.description && (
          <p className="max-w-2xl leading-relaxed text-muted">
            {endgame.description}
          </p>
        )}
        <p className="text-sm text-muted">
          Você joga com as{" "}
          {endgame.userColor === "white" ? "brancas" : "pretas"}.
        </p>
      </div>
      <EndgameTrainer
        endgameId={endgame.id}
        fen={endgame.fen}
        userColor={endgame.userColor}
        goal={endgame.goal}
        maxMoves={endgame.maxMoves}
      />
    </>
  );
}
