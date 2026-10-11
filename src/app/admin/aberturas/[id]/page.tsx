import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm, AdminTextarea } from "@/components/admin/AdminForm";
import { RepertoireFields } from "@/components/admin/ContentFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { treeToText } from "@/lib/openings/editor";
import { createClient } from "@/lib/supabase/server";
import {
  deleteRepertoire,
  saveRepertoire,
  saveRepertoireLines,
} from "../actions";

export const metadata: Metadata = { title: "Repertório" };

const EXAMPLE = `1. e4 {Ocupa o centro.} e5 2. Cf3 Cc6 3. Bc4
1. e4 e5 2. Cf3 d6 3. d4`;

export default async function RepertorioAdminPage({
  params,
}: PageProps<"/admin/aberturas/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/aberturas/${id}`);
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const { data: repertoire } = await supabase
    .from("repertoires")
    .select(
      "id, slug, title, description, color, plan_required, position, is_published, repertoire_nodes (id, parent_id, uci, san, comment, position)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!repertoire) notFound();
  const text = treeToText(
    (repertoire.repertoire_nodes ?? []).map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      uci: row.uci,
      san: row.san,
      comment: row.comment,
      position: row.position,
    })),
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/aberturas"
          className="text-sm text-muted hover:text-text"
        >
          ← Aberturas
        </Link>
        <SectionLabel>Repertório</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {repertoire.title}
        </h1>
        <Link
          href={`/aberturas/${repertoire.slug}`}
          className="text-sm text-accent-text hover:underline"
        >
          Ver como aluno →
        </Link>
      </div>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Linhas</h2>
        <div className="flex flex-col gap-1.5 text-[0.9375rem] leading-relaxed text-muted">
          <p>
            Uma variante por linha, desde o primeiro lance. Linhas com o mesmo
            começo viram um ramo só. Comentário entre chaves, logo depois do
            lance. Pode escrever em português (Cf3, Bc4, Dxf7) ou inglês.
          </p>
          <pre className="overflow-x-auto rounded-control bg-surface-2 p-3 font-mono text-sm text-text">
            {EXAMPLE}
          </pre>
        </div>
        <AdminForm action={saveRepertoireLines} submitLabel="Salvar linhas">
          <input type="hidden" name="id" value={repertoire.id} />
          <AdminTextarea
            name="lines"
            label="Lances"
            defaultValue={text}
            rows={14}
            spellCheck={false}
            className="min-h-64 w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 font-mono text-sm leading-relaxed"
          />
        </AdminForm>
      </Card>

      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Dados do repertório</h2>
        <AdminForm action={saveRepertoire} submitLabel="Salvar">
          <input type="hidden" name="id" value={repertoire.id} />
          <RepertoireFields repertoire={repertoire} />
        </AdminForm>
        <AdminForm
          action={deleteRepertoire}
          submitLabel="Apagar repertório"
          pendingLabel="Apagando..."
          variant="ghost"
          confirm="Apagar o repertório e o progresso dos alunos nele?"
        >
          <input type="hidden" name="id" value={repertoire.id} />
        </AdminForm>
      </Card>
    </>
  );
}
