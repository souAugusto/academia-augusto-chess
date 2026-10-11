import {
  AdminCheckbox,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  PLAN_OPTIONS,
} from "./AdminForm";

// Campos repetidos entre "criar" e "editar" no painel.

type Course = {
  title: string;
  description: string | null;
  plan_required: number;
  position: number;
  is_published: boolean;
};

export function CourseFields({ course }: { course?: Course }) {
  return (
    <>
      <AdminInput
        name="title"
        label="Título"
        defaultValue={course?.title}
        required
      />
      <AdminTextarea
        name="description"
        label="Descrição"
        defaultValue={course?.description ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminSelect
          name="planRequired"
          label="Quem vê"
          defaultValue={String(course?.plan_required ?? 1)}
          options={PLAN_OPTIONS}
        />
        <AdminInput
          name="position"
          label="Ordem"
          type="number"
          min="0"
          defaultValue={course?.position ?? 0}
        />
      </div>
      <AdminCheckbox
        name="isPublished"
        label="Publicado (aparece para os alunos)"
        defaultChecked={course?.is_published}
      />
    </>
  );
}

type Endgame = {
  slug: string;
  title: string;
  description: string | null;
  category: string;
  level: number;
  fen: string;
  user_color: string;
  goal: string;
  max_moves: number;
  plan_required: number;
  position: number;
  is_published: boolean;
};

export function EndgameFields({ endgame }: { endgame?: Endgame }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminInput
          name="title"
          label="Título"
          defaultValue={endgame?.title}
          required
        />
        <AdminInput
          name="slug"
          label="Endereço (slug)"
          defaultValue={endgame?.slug}
          hint="Aparece no link: /finais/lucena"
          required
        />
      </div>
      <AdminTextarea
        name="description"
        label="Explicação para o aluno"
        defaultValue={endgame?.description ?? ""}
      />
      <AdminInput
        name="fen"
        label="Posição (FEN)"
        defaultValue={endgame?.fen}
        hint="Confira no Stockfish se o objetivo é possível antes de publicar."
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminInput
          name="category"
          label="Categoria"
          defaultValue={endgame?.category ?? "Torre"}
          required
        />
        <AdminSelect
          name="level"
          label="Nível"
          defaultValue={String(endgame?.level ?? 1)}
          options={[
            { value: "1", label: "Básico" },
            { value: "2", label: "Intermediário" },
            { value: "3", label: "Avançado" },
          ]}
        />
        <AdminInput
          name="maxMoves"
          label="Limite de lances"
          type="number"
          min="5"
          max="150"
          defaultValue={endgame?.max_moves ?? 50}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminSelect
          name="userColor"
          label="Aluno joga com"
          defaultValue={endgame?.user_color ?? "white"}
          options={[
            { value: "white", label: "Brancas" },
            { value: "black", label: "Pretas" },
          ]}
        />
        <AdminSelect
          name="goal"
          label="Objetivo"
          defaultValue={endgame?.goal ?? "win"}
          options={[
            { value: "win", label: "Vencer" },
            { value: "draw", label: "Empatar" },
          ]}
        />
        <AdminSelect
          name="planRequired"
          label="Quem vê"
          defaultValue={String(endgame?.plan_required ?? 1)}
          options={PLAN_OPTIONS}
        />
      </div>
      <AdminInput
        name="position"
        label="Ordem"
        type="number"
        min="0"
        defaultValue={endgame?.position ?? 0}
      />
      <AdminCheckbox
        name="isPublished"
        label="Publicado (aparece para os alunos)"
        defaultChecked={endgame?.is_published}
      />
    </>
  );
}

type Repertoire = {
  slug: string;
  title: string;
  description: string | null;
  color: string;
  plan_required: number;
  position: number;
  is_published: boolean;
};

export function RepertoireFields({ repertoire }: { repertoire?: Repertoire }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminInput
          name="title"
          label="Título"
          defaultValue={repertoire?.title}
          required
        />
        <AdminInput
          name="slug"
          label="Endereço (slug)"
          defaultValue={repertoire?.slug}
          hint="Aparece no link: /aberturas/italiana"
          required
        />
      </div>
      <AdminTextarea
        name="description"
        label="Descrição"
        defaultValue={repertoire?.description ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminSelect
          name="color"
          label="Aluno joga com"
          defaultValue={repertoire?.color ?? "white"}
          options={[
            { value: "white", label: "Brancas" },
            { value: "black", label: "Pretas" },
          ]}
        />
        <AdminSelect
          name="planRequired"
          label="Quem vê"
          defaultValue={String(repertoire?.plan_required ?? 1)}
          options={PLAN_OPTIONS}
        />
        <AdminInput
          name="position"
          label="Ordem"
          type="number"
          min="0"
          defaultValue={repertoire?.position ?? 0}
        />
      </div>
      <AdminCheckbox
        name="isPublished"
        label="Publicado (aparece para os alunos)"
        defaultChecked={repertoire?.is_published}
      />
    </>
  );
}
