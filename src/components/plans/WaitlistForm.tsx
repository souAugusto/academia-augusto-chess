"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(auth)/actions";
import { joinWaitlist } from "@/app/(site)/planos/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

const initial: FormState = {};

export function WaitlistForm({ email }: { email?: string }) {
  const [state, action] = useActionState(joinWaitlist, initial);
  if (state.success)
    return <FormAlert tone="sucesso">{state.success}</FormAlert>;
  return (
    <form action={action} noValidate className="flex flex-col gap-4 text-left">
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <Field
        id="email-espera"
        name="email"
        type="email"
        label="Seu e-mail"
        autoComplete="email"
        placeholder="voce@email.com"
        defaultValue={state.values?.email ?? email}
        error={state.errors?.email}
        required
      />
      <SubmitButton pendingText="Enviando...">
        Entrar na lista de espera
      </SubmitButton>
    </form>
  );
}
