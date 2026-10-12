import type { Metadata } from "next";
import Link from "next/link";
import { AdminForm } from "@/components/admin/AdminForm";
import { OfficialSetFields } from "@/components/admin/OfficialSetFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { saveOfficialSet } from "./actions";

export const metadata: Metadata = { title: "Conjuntos" };

export default async function ConjuntosAdminPage() {
  await requireAdmin("/admin/conjuntos");
  const supabase = await createClient();
  const { data: sets } = await supabase
    .from("puzzle_sets")
    .select("id, name, position, puzzle_set_items (puzzle_id)")
    .eq("is_official", true)
    .order("position");

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Conjuntos oficiais
        </h1>
        <p className="max-w-2xl text-muted">
          Conjuntos de táticas do método do Intensivo. O aluno resolve todos, na
          ordem, ciclo após ciclo.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {(sets ?? []).map((set) => (
          <li key={set.id}>
            <Link
              href={`/admin/conjuntos/${set.id}`}
              className="flex flex-wrap justify-between gap-2 rounded-card border border-border bg-surface px-5 py-3 hover:border-accent"
            >
              <span className="font-semibold">{set.name}</span>
              <span className="text-sm text-muted">
                {set.puzzle_set_items?.length ?? 0} puzzles
              </span>
            </Link>
          </li>
        ))}
        {(sets ?? []).length === 0 && (
          <p className="text-muted">Nenhum conjunto oficial ainda.</p>
        )}
      </ul>
      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Novo conjunto</h2>
        <AdminForm action={saveOfficialSet} submitLabel="Criar conjunto">
          <OfficialSetFields />
        </AdminForm>
      </Card>
    </>
  );
}
