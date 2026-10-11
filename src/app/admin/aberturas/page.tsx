import type { Metadata } from "next";
import Link from "next/link";
import { AdminForm } from "@/components/admin/AdminForm";
import { RepertoireFields } from "@/components/admin/ContentFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { saveRepertoire } from "./actions";

export const metadata: Metadata = { title: "Aberturas" };

export default async function AberturasAdminPage() {
  await requireAdmin("/admin/aberturas");
  const supabase = await createClient();
  const { data: repertoires } = await supabase
    .from("repertoires")
    .select("id, title, color, is_published, repertoire_nodes (id)")
    .order("position");

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Aberturas
        </h1>
        <p className="max-w-2xl text-muted">
          Repertórios para o aluno estudar e treinar. Crie o repertório e depois
          escreva as linhas de lances.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {(repertoires ?? []).map((repertoire) => (
          <li key={repertoire.id}>
            <Link
              href={`/admin/aberturas/${repertoire.id}`}
              className="flex flex-wrap justify-between gap-2 rounded-card border border-border bg-surface px-5 py-3 hover:border-accent"
            >
              <span className="font-semibold">{repertoire.title}</span>
              <span className="text-sm text-muted">
                {repertoire.color === "white" ? "brancas" : "pretas"} ·{" "}
                {repertoire.repertoire_nodes?.length ?? 0} lance(s) ·{" "}
                {repertoire.is_published ? "publicado" : "rascunho"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Novo repertório</h2>
        <AdminForm action={saveRepertoire} submitLabel="Criar repertório">
          <RepertoireFields />
        </AdminForm>
      </Card>
    </>
  );
}
