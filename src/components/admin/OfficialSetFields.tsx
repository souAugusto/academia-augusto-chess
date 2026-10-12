import { AdminInput, AdminTextarea } from "./AdminForm";

type OfficialSet = {
  name: string;
  description: string | null;
  position: number;
  puzzleIds: string[];
};

export function OfficialSetFields({ set }: { set?: OfficialSet }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <AdminInput
          name="name"
          label="Nome"
          defaultValue={set?.name}
          required
        />
        <AdminInput
          name="position"
          label="Ordem"
          type="number"
          min="0"
          defaultValue={set?.position ?? 0}
        />
      </div>
      <AdminTextarea
        name="description"
        label="Descrição (opcional)"
        defaultValue={set?.description ?? ""}
      />
      <AdminTextarea
        name="puzzleIds"
        label="Puzzles (códigos do Lichess, na ordem do ciclo)"
        defaultValue={set?.puzzleIds.join("\n") ?? ""}
        rows={10}
        spellCheck={false}
        hint="Um por linha, ou separados por espaço. Também vale colar o link lichess.org/training/código. Mudar os puzzles altera o ciclo de quem já começou."
        required
      />
    </>
  );
}
