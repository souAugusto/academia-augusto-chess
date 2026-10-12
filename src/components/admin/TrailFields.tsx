import {
  AdminCheckbox,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  PLAN_OPTIONS,
} from "./AdminForm";

type Trail = {
  slug: string;
  title: string;
  description: string | null;
  plan_required: number;
  position: number;
  is_published: boolean;
};

export function TrailFields({ trail }: { trail?: Trail }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminInput
          name="title"
          label="Título"
          defaultValue={trail?.title}
          required
        />
        <AdminInput
          name="slug"
          label="Endereço (slug)"
          defaultValue={trail?.slug}
          hint="Ex.: do-zero-aos-1200"
          required
        />
      </div>
      <AdminTextarea
        name="description"
        label="Descrição"
        defaultValue={trail?.description ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminSelect
          name="planRequired"
          label="Quem vê"
          defaultValue={String(trail?.plan_required ?? 1)}
          options={PLAN_OPTIONS}
        />
        <AdminInput
          name="position"
          label="Ordem"
          type="number"
          min="0"
          defaultValue={trail?.position ?? 0}
        />
      </div>
      <AdminCheckbox
        name="isPublished"
        label="Publicada (aparece no painel dos alunos)"
        defaultChecked={trail?.is_published}
      />
    </>
  );
}
