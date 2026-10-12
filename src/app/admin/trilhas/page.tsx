import type { Metadata } from "next";
import Link from "next/link";
import { AdminForm } from "@/components/admin/AdminForm";
import { TrailFields } from "@/components/admin/TrailFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { saveTrail } from "./actions";

export const metadata: Metadata = { title: "Trilhas" };

export default async function TrilhasAdminPage() {
  await requireAdmin("/admin/trilhas");
  const supabase = await createClient();
  const { data: trails } = await supabase
    .from("trails")
    .select("id, title, is_published, trail_steps (id)")
    .order("position");

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Trilhas
        </h1>
        <p className="max-w-2xl text-muted">
          Uma trilha é uma sequência de etapas (aulas, aberturas, finais e
          conjuntos de táticas). O aluno vê o progresso e a próxima etapa no
          painel.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {(trails ?? []).map((trail) => (
          <li key={trail.id}>
            <Link
              href={`/admin/trilhas/${trail.id}`}
              className="flex flex-wrap justify-between gap-2 rounded-card border border-border bg-surface px-5 py-3 hover:border-accent"
            >
              <span className="font-semibold">{trail.title}</span>
              <span className="text-sm text-muted">
                {trail.trail_steps?.length ?? 0} etapa(s) ·{" "}
                {trail.is_published ? "publicada" : "rascunho"}
              </span>
            </Link>
          </li>
        ))}
        {(trails ?? []).length === 0 && (
          <p className="text-muted">Nenhuma trilha ainda.</p>
        )}
      </ul>
      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Nova trilha</h2>
        <AdminForm action={saveTrail} submitLabel="Criar trilha">
          <TrailFields />
        </AdminForm>
      </Card>
    </>
  );
}
