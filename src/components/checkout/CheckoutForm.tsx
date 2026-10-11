"use client";

import { useActionState, useState } from "react";
import { startCheckout } from "@/app/(app)/checkout/actions";
import type { FormState } from "@/app/(auth)/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

const initial: FormState = {};

const METHODS = [
  {
    id: "PIX",
    title: "Pix",
    text: "Você paga o primeiro mês agora. Todo mês chega uma nova cobrança Pix por e-mail.",
  },
  {
    id: "CREDIT_CARD",
    title: "Cartão de crédito",
    text: "A renovação é automática no mesmo cartão, todo mês.",
  },
] as const;

// "52998224725" -> "529.982.247-25" enquanto o aluno digita.
function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

export function CheckoutForm({ planId }: { planId: string }) {
  const [state, action] = useActionState(startCheckout, initial);
  const [cpf, setCpf] = useState(state.values?.cpf ?? "");
  const [method, setMethod] = useState(state.values?.method || "PIX");

  return (
    <form action={action} noValidate className="flex flex-col gap-6">
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <input type="hidden" name="plan" value={planId} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">
          Forma de pagamento
        </legend>
        {METHODS.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer gap-3 rounded-control border p-4 transition ${
              method === item.id
                ? "border-accent bg-surface-2"
                : "border-border-strong hover:border-accent"
            }`}
          >
            <input
              type="radio"
              name="method"
              value={item.id}
              checked={method === item.id}
              onChange={() => setMethod(item.id)}
              className="mt-1 size-4 accent-accent"
            />
            <span className="flex flex-col gap-1">
              <span className="font-semibold">{item.title}</span>
              <span className="text-sm leading-relaxed text-muted">
                {item.text}
              </span>
            </span>
          </label>
        ))}
        {state.errors?.method && (
          <span className="text-sm text-danger">{state.errors.method}</span>
        )}
      </fieldset>

      <Field
        id="cpf"
        name="cpf"
        label="CPF de quem vai pagar"
        inputMode="numeric"
        autoComplete="off"
        placeholder="000.000.000-00"
        value={cpf}
        onChange={(event) => setCpf(maskCpf(event.target.value))}
        error={state.errors?.cpf}
        hint="O Asaas, que processa o pagamento, exige o CPF para emitir a cobrança. A Finale não guarda o seu CPF."
        required
      />

      <SubmitButton pendingText="Abrindo o pagamento...">
        Ir para o pagamento
      </SubmitButton>
      <p className="text-center text-[0.8125rem] leading-normal text-muted">
        O pagamento acontece na página segura do Asaas. A Finale não vê nem
        guarda os dados do seu cartão. Cancele quando quiser em Minha conta.
      </p>
    </form>
  );
}
