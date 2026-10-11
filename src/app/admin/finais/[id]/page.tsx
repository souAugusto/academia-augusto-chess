import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { EndgameFields } from "@/components/admin/ContentFields";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { createClient } from "@/lib/supabase/server";
import { deleteEndgame, saveEndgame } from "../actions";

export const metadata: Metadata = { title: "Final" };

export default async function FinalAdminPage({
  params,
}: PageProps<"/admin/finais/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/finais/${id}`);
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: endgame } = await supabase
    .from("endgames")
    .select(
      "id, slug, title, description, category, level, fen, user_color, goal, max_moves, plan_required, position, is_published",
    )
    .eq("id", id)
    .maybeSingle();
  if (!endgame) notFound();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/finais"
          className="text-sm text-muted hover:text-text"
        >
          ← Finais
        </Link>
        <SectionLabel>Final</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {endgame.title}
        </h1>
        <Link
          href={`/finais/${endgame.slug}`}
          className="text-sm text-accent-text hover:underline"
        >
          Jogar como aluno →
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="flex flex-col gap-4">
          <AdminForm action={saveEndgame} submitLabel="Salvar final">
            <input type="hidden" name="id" value={endgame.id} />
            <EndgameFields endgame={endgame} />
          </AdminForm>
        </Card>
        <div className="flex flex-col gap-4">
          <StaticBoard
            fen={endgame.fen}
            orientation={endgame.user_color === "black" ? "b" : "w"}
            label={`Posição inicial de ${endgame.title}`}
          />
          <AdminForm
            action={deleteEndgame}
            submitLabel="Apagar final"
            pendingLabel="Apagando..."
            variant="ghost"
            confirm="Apagar este final? As tentativas dos alunos também saem."
          >
            <input type="hidden" name="id" value={endgame.id} />
          </AdminForm>
        </div>
      </div>
    </>
  );
}
