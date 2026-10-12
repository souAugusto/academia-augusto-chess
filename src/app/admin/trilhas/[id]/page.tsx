import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm, AdminInput } from "@/components/admin/AdminForm";
import { TrailFields } from "@/components/admin/TrailFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { STEP_LABELS, type StepKind } from "@/lib/trails";
import { createClient } from "@/lib/supabase/server";
import {
  addStep,
  deleteStep,
  deleteTrail,
  saveTrail,
  updateStep,
} from "../actions";

export const metadata: Metadata = { title: "Trilha" };

export default async function TrilhaAdminPage({
  params,
}: PageProps<"/admin/trilhas/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/trilhas/${id}`);
  if (!isUuid(id)) notFound();
  const supabase = await createClient();
  const [{ data: trail }, lessons, repertoires, endgames, sets] =
    await Promise.all([
      supabase
        .from("trails")
        .select(
          "id, slug, title, description, plan_required, position, is_published, trail_steps (id, kind, title, position)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("lessons")
        .select("id, title, modules (title, courses (title))")
        .order("position"),
      supabase.from("repertoires").select("id, title").order("position"),
      supabase.from("endgames").select("id, title").order("level"),
      supabase
        .from("puzzle_sets")
        .select("id, name")
        .eq("is_official", true)
        .order("position"),
    ]);
  if (!trail) notFound();
  const steps = [...(trail.trail_steps ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  // Opções do select: "tipo:id", agrupadas por tipo.
  const groups: {
    kind: StepKind;
    options: { value: string; label: string }[];
  }[] = [
    {
      kind: "lesson",
      options: (lessons.data ?? []).map((lesson) => {
        const parent = lesson.modules as unknown as {
          title: string;
          courses: { title: string } | null;
        } | null;
        return {
          value: `lesson:${lesson.id}`,
          label: `${parent?.courses?.title ?? "Curso"} › ${lesson.title}`,
        };
      }),
    },
    {
      kind: "repertoire",
      options: (repertoires.data ?? []).map((row) => ({
        value: `repertoire:${row.id}`,
        label: row.title,
      })),
    },
    {
      kind: "endgame",
      options: (endgames.data ?? []).map((row) => ({
        value: `endgame:${row.id}`,
        label: row.title,
      })),
    },
    {
      kind: "set",
      options: (sets.data ?? []).map((row) => ({
        value: `set:${row.id}`,
        label: row.name,
      })),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/trilhas"
          className="text-sm text-muted hover:text-text"
        >
          ← Trilhas
        </Link>
        <SectionLabel>Trilha</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {trail.title}
        </h1>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="etapas">
        <h2 id="etapas" className="text-lg font-semibold">
          Etapas
        </h2>
        {steps.length === 0 && (
          <p className="text-muted">Nenhuma etapa ainda.</p>
        )}
        <ol className="flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.id}>
              <Card className="flex flex-wrap items-end justify-between gap-3 p-4">
                <AdminForm
                  action={updateStep}
                  submitLabel="Salvar"
                  variant="secondary"
                  className="flex flex-1 flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="id" value={step.id} />
                  <span className="text-xs font-semibold tracking-label text-accent-text uppercase sm:w-full">
                    {STEP_LABELS[step.kind as StepKind]}
                  </span>
                  <div className="min-w-48 flex-1">
                    <AdminInput
                      id={`titulo-${step.id}`}
                      name="title"
                      label="Título"
                      defaultValue={step.title}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <AdminInput
                      id={`ordem-${step.id}`}
                      name="position"
                      label="Ordem"
                      type="number"
                      min="0"
                      defaultValue={step.position}
                    />
                  </div>
                </AdminForm>
                <AdminForm
                  action={deleteStep}
                  submitLabel="Remover"
                  pendingLabel="Removendo..."
                  variant="ghost"
                >
                  <input type="hidden" name="id" value={step.id} />
                </AdminForm>
              </Card>
            </li>
          ))}
        </ol>

        <Card className="flex flex-col gap-3">
          <h3 className="font-semibold">Adicionar etapa</h3>
          <AdminForm action={addStep} submitLabel="Adicionar">
            <input type="hidden" name="trailId" value={trail.id} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="etapa-ref" className="text-sm font-semibold">
                Conteúdo
              </label>
              <select
                id="etapa-ref"
                name="ref"
                required
                className="min-h-touch w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-base text-text"
              >
                <option value="">Escolha…</option>
                {groups.map((group) =>
                  group.options.length > 0 ? (
                    <optgroup key={group.kind} label={STEP_LABELS[group.kind]}>
                      {group.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null,
                )}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
              <AdminInput
                id="etapa-titulo"
                name="title"
                label="Título (opcional)"
                hint="Vazio = usa o nome do conteúdo."
              />
              <AdminInput
                id="etapa-ordem"
                name="position"
                label="Ordem"
                type="number"
                min="0"
                defaultValue={steps.length}
              />
            </div>
          </AdminForm>
        </Card>
      </section>

      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Dados da trilha</h2>
        <AdminForm action={saveTrail} submitLabel="Salvar trilha">
          <input type="hidden" name="id" value={trail.id} />
          <TrailFields trail={trail} />
        </AdminForm>
        <AdminForm
          action={deleteTrail}
          submitLabel="Apagar trilha"
          pendingLabel="Apagando..."
          variant="ghost"
          confirm="Apagar esta trilha?"
        >
          <input type="hidden" name="id" value={trail.id} />
        </AdminForm>
      </Card>
    </>
  );
}
