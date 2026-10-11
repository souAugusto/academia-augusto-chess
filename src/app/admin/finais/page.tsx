import type { Metadata } from "next";
import Link from "next/link";
import { AdminForm } from "@/components/admin/AdminForm";
import { EndgameFields } from "@/components/admin/ContentFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { LEVEL_LABELS } from "@/lib/data/endgames";
import { createClient } from "@/lib/supabase/server";
import { saveEndgame } from "./actions";

export const metadata: Metadata = { title: "Finais" };

export default async function FinaisAdminPage() {
  await requireAdmin("/admin/finais");
  const supabase = await createClient();
  const { data: endgames } = await supabase
    .from("endgames")
    .select("id, title, category, level, is_published")
    .order("level")
    .order("position");

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Finais
        </h1>
        <p className="max-w-2xl text-muted">
          Posições para o aluno jogar contra o Stockfish até vencer ou segurar o
          empate.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {(endgames ?? []).map((endgame) => (
          <li key={endgame.id}>
            <Link
              href={`/admin/finais/${endgame.id}`}
              className="flex flex-wrap justify-between gap-2 rounded-card border border-border bg-surface px-5 py-3 hover:border-accent"
            >
              <span className="font-semibold">{endgame.title}</span>
              <span className="text-sm text-muted">
                {endgame.category} · {LEVEL_LABELS[endgame.level]} ·{" "}
                {endgame.is_published ? "publicado" : "rascunho"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Novo final</h2>
        <AdminForm action={saveEndgame} submitLabel="Criar final">
          <EndgameFields />
        </AdminForm>
      </Card>
    </>
  );
}
