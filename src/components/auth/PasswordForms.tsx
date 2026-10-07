"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestPasswordReset,
  updatePassword,
  type FormState,
} from "@/app/(auth)/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

const initial: FormState = {};

export function RequestResetForm() {
  const [state, action] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[1.875rem] font-bold">
          Esqueci minha senha
        </h1>
        <p className="text-[0.9375rem] text-muted">
          Digite o e-mail da sua conta. Enviaremos um link para você criar uma
          nova senha.
        </p>
      </div>
      {state.success ? (
        <FormAlert tone="sucesso">{state.success}</FormAlert>
      ) : (
        <>
          <Field
            id="email-recuperar"
            name="email"
            type="email"
            label="E-mail"
            placeholder="voce@email.com"
            autoComplete="email"
            required
            defaultValue={state.values?.email}
            error={state.errors?.email}
          />
          <SubmitButton pendingText="Enviando...">Enviar link</SubmitButton>
        </>
      )}
      <Link
        href="/entrar"
        className="text-center text-sm text-accent-text underline-offset-4 hover:underline"
      >
        Voltar para o login
      </Link>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, initial);
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[1.875rem] font-bold">
          Criar nova senha
        </h1>
        <p className="text-[0.9375rem] text-muted">
          Escolha uma senha com pelo menos 8 caracteres.
        </p>
      </div>
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <Field
        id="nova-senha"
        name="password"
        type="password"
        label="Nova senha"
        autoComplete="new-password"
        required
        minLength={8}
        error={state.errors?.password}
      />
      <Field
        id="confirmar-senha"
        name="confirm"
        type="password"
        label="Repita a nova senha"
        autoComplete="new-password"
        required
        error={state.errors?.confirm}
      />
      <SubmitButton pendingText="Salvando...">Salvar nova senha</SubmitButton>
    </form>
  );
}
