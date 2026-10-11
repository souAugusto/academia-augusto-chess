import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanRequired } from "@/components/app/PlanRequired";
import { RepertoireTrainer } from "@/components/openings/RepertoireTrainer";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getRepertoire } from "@/lib/data/repertoires";

export const metadata: Metadata = { title: "Repertório" };

const SLUG = /^[a-z0-9-]{2,60}$/;

export default async function RepertorioPage({
  params,
}: PageProps<"/aberturas/[repertorio]">) {
  const { repertorio } = await params;
  const user = await requireUser(`/aberturas/${repertorio}`);
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Aberturas"
        text="Este repertório faz parte da assinatura."
      />
    );
  }
  if (!SLUG.test(repertorio)) notFound();
  const repertoire = await getRepertoire(repertorio);
  if (!repertoire) notFound();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/aberturas" className="text-sm text-muted hover:text-text">
          ← Aberturas
        </Link>
        <SectionLabel>
          {repertoire.color === "white" ? "Com as brancas" : "Com as pretas"}
        </SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {repertoire.title}
        </h1>
        {repertoire.description && (
          <p className="max-w-2xl leading-relaxed text-muted">
            {repertoire.description}
          </p>
        )}
      </div>
      <RepertoireTrainer
        repertoireId={repertoire.id}
        color={repertoire.color}
        nodes={repertoire.nodes}
        openingNames={repertoire.openingNames}
        progress={repertoire.progress}
      />
    </>
  );
}
