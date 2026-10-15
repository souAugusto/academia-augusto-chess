"use client";

import { useActionState, useEffect, useState } from "react";
import {
  changeEmail,
  changePassword,
  signOutEverywhere,
  type ProfileState,
} from "@/app/(app)/conta/perfil/actions";
import { Field } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { passwordStrength } from "@/lib/validation/profile";

const initial: ProfileState = {};

// Mostra o resultado de cada formulário num aviso (toast).
function useResultToast(state: ProfileState) {
  const toast = useToast();
  useEffect(() => {
    if (state.ok && state.message) toast("sucesso", state.message);
    else if (state.message) toast("erro", state.message);
  }, [state, toast]);
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changeEmail, initial);
  const [value, setValue] = useState("");
  useResultToast(state);
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <p className="text-[0.9375rem] text-muted">
        E-mail atual: <span className="font-semibold text-text">{email}</span>
      </p>
      <Field
        id="new-email"
        name="email"
        type="email"
        label="Novo e-mail"
        autoComplete="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={state.errors?.email}
        hint="Enviamos um link de confirmação. O e-mail só muda depois que você confirmar."
      />
      <div>
        <button
          type="submit"
          disabled={!value.trim() || pending}
          className={buttonClasses("primary")}
        >
          {pending ? "Enviando..." : "Alterar e-mail"}
        </button>
      </div>
    </form>
  );
}

const STRENGTH = [
  { label: "Muito curta", color: "bg-danger" },
  { label: "Fraca", color: "bg-danger" },
  { label: "Razoável", color: "bg-accent" },
  { label: "Boa", color: "bg-success" },
  { label: "Forte", color: "bg-success" },
];

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, initial);
  const [values, setValues] = useState({
    current: "",
    password: "",
    confirm: "",
  });
  useResultToast(state);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- limpa os campos depois de salvar
    if (state.ok) setValues({ current: "", password: "", confirm: "" });
  }, [state]);
  const strength = passwordStrength(values.password);
  const set =
    (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));
  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <Field
        id="current"
        name="current"
        type="password"
        label="Senha atual"
        autoComplete="current-password"
        value={values.current}
        onChange={set("current")}
        error={state.errors?.current}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Field
            id="password"
            name="password"
            type="password"
            label="Nova senha"
            autoComplete="new-password"
            value={values.password}
            onChange={set("password")}
            error={state.errors?.password}
          />
          {values.password && (
            <div className="flex items-center gap-2" aria-live="polite">
              <div className="flex h-1.5 flex-1 gap-1" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={`flex-1 rounded-full ${
                      strength >= step
                        ? STRENGTH[strength].color
                        : "bg-surface-2"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[0.8125rem] text-muted">
                Força: {STRENGTH[strength].label}
              </span>
            </div>
          )}
        </div>
        <Field
          id="confirm-password"
          name="confirm"
          type="password"
          label="Repita a nova senha"
          autoComplete="new-password"
          value={values.confirm}
          onChange={set("confirm")}
          error={state.errors?.confirm}
        />
      </div>
      <p className="text-[0.8125rem] text-muted">
        Pelo menos 8 caracteres. Misture letras maiúsculas e minúsculas, números
        e símbolos para deixar mais forte.
      </p>
      <div>
        <button
          type="submit"
          disabled={!values.current || !values.password || pending}
          className={buttonClasses("primary")}
        >
          {pending ? "Salvando..." : "Alterar senha"}
        </button>
      </div>
    </form>
  );
}

export function SignOutEverywhere() {
  const [confirming, setConfirming] = useState(false);
  if (!confirming)
    return (
      <div>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={buttonClasses("secondary")}
        >
          Sair de todos os dispositivos
        </button>
      </div>
    );
  return (
    <form action={signOutEverywhere} className="flex flex-col gap-3">
      <p className="text-[0.9375rem] text-muted">
        Você vai sair em todos os aparelhos, inclusive neste, e precisará entrar
        de novo.
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={buttonClasses("primary")}>
          Sair de todos
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonClasses("ghost")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
