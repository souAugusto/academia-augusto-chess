import {
  CLASS_LABELS,
  CLASS_ORDER,
  type MoveClass,
} from "@/lib/analysis/classify";
import { MoveClassIcon } from "./MoveClassIcon";

const percent = (value: number | null) =>
  value === null ? "—" : `${value.toLocaleString("pt-BR")}%`;

// Resumo por jogador: precisão e contagem de lances por classe (com ícone).
export function PlayerSummary({
  names,
  accuracy,
  counts,
}: {
  names: { w: string; b: string };
  accuracy: { w: number | null; b: number | null };
  counts: { w: Record<MoveClass, number>; b: Record<MoveClass, number> };
}) {
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">
        Precisão e contagem de lances por classe
      </caption>
      <thead>
        <tr>
          <th scope="col" className="w-1/2" />
          <th
            scope="col"
            className="max-w-24 truncate px-1 pb-2 text-center font-semibold"
          >
            <span className="mb-1 mx-auto block size-3 rounded-full border border-border-strong bg-eval-light" />
            {names.w}
          </th>
          <th
            scope="col"
            className="max-w-24 truncate px-1 pb-2 text-center font-semibold"
          >
            <span className="mb-1 mx-auto block size-3 rounded-full border border-border-strong bg-eval-dark" />
            {names.b}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-y border-border">
          <th scope="row" className="py-2 text-left font-semibold">
            Precisão
          </th>
          <td className="py-2 text-center font-display text-lg font-bold">
            {percent(accuracy.w)}
          </td>
          <td className="py-2 text-center font-display text-lg font-bold">
            {percent(accuracy.b)}
          </td>
        </tr>
        {CLASS_ORDER.map((cls) => (
          <tr key={cls}>
            <th scope="row" className="py-1 text-left font-normal">
              <span className="flex items-center gap-2">
                <MoveClassIcon cls={cls} size={18} decorative />
                {CLASS_LABELS[cls]}
              </span>
            </th>
            <td className="py-1 text-center tabular-nums">{counts.w[cls]}</td>
            <td className="py-1 text-center tabular-nums">{counts.b[cls]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
