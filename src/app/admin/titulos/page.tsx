import type { Metadata } from "next";
import { AdminForm, AdminInput } from "@/components/admin/AdminForm";
import { TitleBadge } from "@/components/titles/TitleBadge";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTitle, updateTitle } from "./actions";

export const metadata: Metadata = { title: "Títulos" };

type Row = {
  id: number;
  name: string;
  min_rating: number;
  tagline: string | null;
  color: string;
};

function TitleFields({ row, prefix }: { row?: Row; prefix: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <AdminInput
        id={`${prefix}-nome`}
        name="name"
        label="Nome"
        defaultValue={row?.name}
        maxLength={40}
        required
      />
      <AdminInput
        id={`${prefix}-rating`}
        name="minRating"
        label="Rating mínimo"
        type="number"
        min="0"
        max="4000"
        defaultValue={row?.min_rating}
        required
      />
      <AdminInput
        id={`${prefix}-frase`}
        name="tagline"
        label="Frase de efeito"
        defaultValue={row?.tagline ?? ""}
        maxLength={120}
      />
      <AdminInput
        id={`${prefix}-cor`}
        name="color"
        label="Cor"
        type="color"
        defaultValue={row?.color ?? "#D4AF57"}
      />
    </div>
  );
}

export default async function TitulosAdminPage() {
  await requireAdmin("/admin/titulos");
  const admin = createAdminClient();
  const [{ data: titles }, { data: earned }] = await Promise.all([
    admin
      .from("titles")
      .select("id, name, min_rating, tagline, color")
      .order("min_rating"),
    admin.from("user_titles").select("title_id"),
  ]);
  const holders = new Map<number, number>();
  for (const row of earned ?? [])
    holders.set(row.title_id, (holders.get(row.title_id) ?? 0) + 1);

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Títulos
        </h1>
        <p className="max-w-2xl text-muted">
          A escada de títulos do rating de táticas. Título conquistado é
          permanente: mudar o rating mínimo não tira o título de quem já tem.
          Não use títulos oficiais da FIDE ou da federação.
        </p>
      </div>

      <ul className="flex flex-col gap-4">
        {((titles ?? []) as Row[]).map((row) => (
          <li key={row.id}>
            <Card className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TitleBadge name={row.name} color={row.color} />
                <span className="text-sm text-muted">
                  {holders.get(row.id) ?? 0} aluno(s) com este título
                </span>
              </div>
              <AdminForm action={updateTitle} submitLabel="Salvar">
                <input type="hidden" name="id" value={row.id} />
                <TitleFields row={row} prefix={`t${row.id}`} />
              </AdminForm>
            </Card>
          </li>
        ))}
      </ul>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Novo título</h2>
        <AdminForm action={createTitle} submitLabel="Criar título">
          <TitleFields prefix="novo" />
        </AdminForm>
      </Card>
    </>
  );
}
