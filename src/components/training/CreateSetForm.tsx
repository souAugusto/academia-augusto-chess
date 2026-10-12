"use client";

import { useActionState, useId, useState } from "react";
import type { FormState } from "@/app/(auth)/actions";
import { createSet } from "@/app/(app)/treino/actions";
import { FormAlert } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { THEME_FILTERS, themeLabel } from "@/lib/chess/themes";

const initial: FormState = {};
const SIZES = [10, 20, 30, 50];

const selectClass =
  "min-h-touch rounded-control border border-border-strong bg-surface px-3 text-base text-text";

export function CreateSetForm() {
  const [state, action] = useActionState(createSet, initial);
  const [source, setSource] = useState<"tema" | "erros">("tema");
  const themeId = useId();
  const sizeId = useId();

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">
          Montar a partir de
        </legend>
        <div className="grid grid-cols-2 gap-1 rounded-control bg-surface-2 p-1">
          {(
            [
              ["tema", "Um tema"],
              ["erros", "Meus erros"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex min-h-touch cursor-pointer items-center justify-center rounded-[0.6rem] text-sm font-semibold transition ${
                source === value
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:text-text"
              }`}
            >
              <input
                type="radio"
                name="source"
                value={value}
                checked={source === value}
                onChange={() => setSource(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {source === "tema" && (
          <div className="flex flex-col gap-2">
            <label htmlFor={themeId} className="text-sm font-semibold">
              Tema
            </label>
            <select id={themeId} name="theme" className={selectClass}>
              <option value="">Temas variados</option>
              {THEME_FILTERS.map((id) => (
                <option key={id} value={id}>
                  {themeLabel(id)}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor={sizeId} className="text-sm font-semibold">
            Quantidade de puzzles
          </label>
          <select
            id={sizeId}
            name="size"
            defaultValue="20"
            className={selectClass}
          >
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted">
        {source === "tema"
          ? "Os puzzles são sorteados perto do seu rating e ficam fixos no conjunto."
          : "Junta os puzzles que você mais errou nas táticas."}
      </p>
      <SubmitButton pendingText="Montando...">Criar conjunto</SubmitButton>
    </form>
  );
}
