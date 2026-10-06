import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  labelAside?: ReactNode; // ex.: link "Esqueci minha senha"
};

export function Field({
  id,
  label,
  error,
  hint,
  labelAside,
  ...input
}: FieldProps) {
  const hintId = hint ? `${id}-dica` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [errorId, hintId].filter(Boolean).join(" ") || undefined
        }
        className="min-h-toque rounded-campo border border-borda-forte bg-superficie px-3.5 py-3.5 text-base text-texto placeholder:text-texto-discreto focus:outline-2 focus:outline-offset-1 focus:outline-dourado aria-invalid:border-erro"
        {...input}
      />
      {error && (
        <span id={errorId} className="text-sm text-erro">
          {error}
        </span>
      )}
      {hint && (
        <span id={hintId} className="text-[0.8125rem] text-texto-discreto">
          {hint}
        </span>
      )}
    </div>
  );
}

export function FormAlert({
  tone,
  children,
}: {
  tone: "erro" | "sucesso";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "erro" ? "alert" : "status"}
      className={`rounded-campo border px-4 py-3 text-[0.9375rem] leading-relaxed ${
        tone === "erro"
          ? "border-erro text-erro"
          : "border-dourado bg-superficie-alta text-texto"
      }`}
    >
      {children}
    </p>
  );
}
