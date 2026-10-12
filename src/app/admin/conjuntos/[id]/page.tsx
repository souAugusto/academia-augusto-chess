import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { OfficialSetFields } from "@/components/admin/OfficialSetFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { createClient } from "@/lib/supabase/server";
import { deleteOfficialSet, saveOfficialSet } from "../actions";

export const metadata: Metadata = { title: "Conjunto" };

export default async function ConjuntoAdminPage({
  params,
}: PageProps<"/admin/conjuntos/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/conjuntos/${id}`);
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: set } = await supabase
    .from("puzzle_sets")
    .select(
      "id, name, description, position, puzzle_set_items (puzzle_id, position)",
    )
    .eq("id", id)
    .eq("is_official", true)
    .maybeSingle();
  if (!set) notFound();
  const puzzleIds = [...(set.puzzle_set_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => item.puzzle_id);

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/conjuntos"
          className="text-sm text-muted hover:text-text"
        >
          ← Conjuntos
        </Link>
        <SectionLabel>Conjunto oficial</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {set.name}
        </h1>
      </div>
      <Card className="flex max-w-3xl flex-col gap-4">
        <AdminForm action={saveOfficialSet} submitLabel="Salvar conjunto">
          <input type="hidden" name="id" value={set.id} />
          <OfficialSetFields
            set={{
              name: set.name,
              description: set.description,
              position: set.position,
              puzzleIds,
            }}
          />
        </AdminForm>
      </Card>
      <AdminForm
        action={deleteOfficialSet}
        submitLabel="Apagar conjunto"
        pendingLabel="Apagando..."
        variant="ghost"
        confirm="Apagar o conjunto? Os ciclos dos alunos nele também saem."
      >
        <input type="hidden" name="id" value={set.id} />
      </AdminForm>
    </>
  );
}
