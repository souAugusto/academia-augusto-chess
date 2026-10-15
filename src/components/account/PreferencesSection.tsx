"use client";

import { useEffect, useState } from "react";
import { AppearancePanel } from "@/components/preferences/AppearancePanel";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { useToast } from "@/components/ui/Toast";
import {
  applyThemeChoice,
  readThemeChoice,
  type ThemeChoice,
} from "@/lib/theme";

const THEMES: { value: ThemeChoice; label: string }[] = [
  { value: "dark", label: "Escuro" },
  { value: "light", label: "Claro" },
  { value: "system", label: "Igual ao aparelho" },
];

const EMAILS = [
  {
    key: "lembretes",
    label: "Lembretes de treino",
    hint: "Um lembrete quando a sequência de dias estiver para acabar.",
  },
  {
    key: "novidades",
    label: "Novidades",
    hint: "Aulas, lições e lives novas.",
  },
  {
    key: "assinatura",
    label: "Avisos de assinatura",
    hint: "Renovação, pagamento e fim do teste grátis.",
  },
] as const;

function Switch({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-h-touch items-center justify-between gap-4">
      <label htmlFor={id} className="flex flex-col">
        <span className="text-[0.9375rem] font-semibold">{label}</span>
        {hint && <span className="text-[0.8125rem] text-muted">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          checked
            ? "border-accent bg-accent"
            : "border-border-strong bg-surface-2"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 size-5.5 rounded-full bg-bg shadow transition-[left] ${
            checked ? "left-[1.4rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function ThemeSelect() {
  const [choice, setChoice] = useState<ThemeChoice>("dark");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a escolha só existe no navegador
    setChoice(readThemeChoice());
  }, []);
  useEffect(() => {
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const follow = () => applyThemeChoice("system");
    media.addEventListener("change", follow);
    return () => media.removeEventListener("change", follow);
  }, [choice]);
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-semibold">Tema</legend>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <label
            key={theme.value}
            className={`flex min-h-touch cursor-pointer items-center gap-2 rounded-control border px-4 text-[0.9375rem] ${
              choice === theme.value
                ? "border-accent bg-surface-2 font-semibold"
                : "border-border hover:border-border-strong"
            }`}
          >
            <input
              type="radio"
              name="tema"
              value={theme.value}
              checked={choice === theme.value}
              onChange={() => {
                setChoice(theme.value);
                applyThemeChoice(theme.value);
              }}
              className="size-4 accent-[var(--accent)]"
            />
            {theme.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function PreferencesSection() {
  const { prefs, update } = usePreferences();
  const toast = useToast();
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 md:grid-cols-2">
        <ThemeSelect />
        <div className="flex flex-col gap-2">
          <label htmlFor="idioma" className="text-sm font-semibold">
            Idioma
          </label>
          <select
            id="idioma"
            disabled
            value="pt-BR"
            className="min-h-touch rounded-control border border-border-strong bg-surface px-3 text-base text-text disabled:opacity-80"
          >
            <option value="pt-BR">Português (Brasil)</option>
          </select>
          <span className="text-[0.8125rem] text-muted">
            Por enquanto, o site está só em português.
          </span>
        </div>
      </div>

      <AppearancePanel idPrefix="conta" />

      <fieldset className="flex flex-col gap-1 rounded-card border border-border p-5">
        <legend className="px-1 text-sm font-semibold tracking-label text-accent-text uppercase">
          E-mails
        </legend>
        {EMAILS.map((item) => (
          <Switch
            key={item.key}
            id={`email-${item.key}`}
            label={item.label}
            hint={item.hint}
            checked={prefs.emails[item.key]}
            onChange={(value) => {
              update((p) => ({
                ...p,
                emails: { ...p.emails, [item.key]: value },
              }));
              toast("sucesso", "Preferência salva.");
            }}
          />
        ))}
        <p className="pt-2 text-[0.8125rem] text-muted">
          A Finale ainda não envia esses e-mails; sua escolha fica guardada para
          quando eles começarem.
        </p>
      </fieldset>
      <p className="text-[0.8125rem] text-muted">
        Tudo nesta seção é salvo automaticamente. Tabuleiro, peças, sons e
        e-mails valem em qualquer aparelho; o tema fica guardado neste
        navegador.
      </p>
    </div>
  );
}
