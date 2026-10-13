"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(auth)/actions";
import { linkAccount } from "@/app/(app)/partidas/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { PLATFORM_LABELS, type Platform } from "@/lib/games/normalize";

const initial: FormState = {};

export function LinkAccountForm({ platform }: { platform: Platform }) {
  const [state, action] = useActionState(linkAccount, initial);
  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      {state.success && <FormAlert tone="sucesso">{state.success}</FormAlert>}
      <input type="hidden" name="platform" value={platform} />
      <Field
        id={`usuario-${platform}`}
        name="username"
        label={`Usuário no ${PLATFORM_LABELS[platform]}`}
        placeholder="seu_usuario"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={state.values?.username}
        error={state.errors?.username}
        required
      />
      <SubmitButton variant="secondary" pendingText="Conferindo...">
        Vincular conta
      </SubmitButton>
    </form>
  );
}
