"use client";

import { useActionState } from "react";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button";
import type { AdminState } from "@/lib/data/admin";

type AdminFormProps = {
  action: (state: AdminState, formData: FormData) => Promise<AdminState>;
  submitLabel: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
  confirm?: string; // pergunta antes de enviar (ex.: apagar)
  className?: string;
  children?: React.ReactNode;
};

// Formulário do painel: mostra erro ou confirmação que a action devolver.
export function AdminForm({
  action,
  submitLabel,
  pendingLabel = "Salvando...",
  variant = "primary",
  confirm,
  className = "flex flex-col gap-4",
  children,
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form
      action={formAction}
      className={className}
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      {state.success && <FormAlert tone="sucesso">{state.success}</FormAlert>}
      <div>
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses(variant)}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "min-h-touch w-full rounded-control border border-border-strong bg-surface px-3 py-2.5 text-base text-text placeholder:text-muted focus:outline-2 focus:outline-offset-1 focus:outline-accent";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function AdminInput({ label, hint, id, ...input }: InputProps) {
  const fieldId = id ?? `campo-${input.name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
      </label>
      <input id={fieldId} className={inputClass} {...input} />
      {hint && <span className="text-[0.8125rem] text-muted">{hint}</span>}
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function AdminTextarea({ label, hint, id, ...input }: TextareaProps) {
  const fieldId = id ?? `campo-${input.name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
      </label>
      <textarea
        id={fieldId}
        className={`${inputClass} min-h-24 font-[inherit]`}
        {...input}
      />
      {hint && <span className="text-[0.8125rem] text-muted">{hint}</span>}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: { value: string; label: string }[];
};

export function AdminSelect({ label, options, id, ...select }: SelectProps) {
  const fieldId = id ?? `campo-${select.name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-semibold">
        {label}
      </label>
      <select id={fieldId} className={inputClass} {...select}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function AdminCheckbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex min-h-touch items-center gap-3 text-[0.9375rem]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-5 accent-accent"
      />
      {label}
    </label>
  );
}

export const PLAN_OPTIONS = [
  { value: "1", label: "Membro e Intensivo" },
  { value: "2", label: "Só Intensivo" },
];
