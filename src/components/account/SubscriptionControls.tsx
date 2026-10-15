"use client";

import { useActionState, useEffect, useState } from "react";
import {
  changePaymentMethod,
  reactivateSubscription,
  type BillingState,
} from "@/app/(app)/conta/actions";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

const initial: BillingState = {};

function useResultToast(state: BillingState) {
  const toast = useToast();
  useEffect(() => {
    if (state.message) toast(state.ok ? "sucesso" : "erro", state.message);
  }, [state, toast]);
}

// Pix ou cartão para as próximas cobranças.
export function PaymentMethodForm({
  subscriptionId,
  current,
}: {
  subscriptionId: string;
  current: "PIX" | "CREDIT_CARD" | null;
}) {
  const [state, action, pending] = useActionState(changePaymentMethod, initial);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState(current ?? "PIX");
  useResultToast(state);
  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses("secondary")}
      >
        Atualizar forma de pagamento
      </button>
    );
  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">
          Forma de pagamento das próximas cobranças
        </legend>
        {(
          [
            ["PIX", "Pix"],
            ["CREDIT_CARD", "Cartão de crédito"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex min-h-touch items-center gap-3">
            <input
              type="radio"
              name="method"
              value={value}
              checked={method === value}
              onChange={() => setMethod(value)}
              className="size-5 accent-[var(--accent)]"
            />
            {label}
            {current === value && (
              <span className="text-sm text-muted">(atual)</span>
            )}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={method === current || pending}
          className={buttonClasses("primary")}
        >
          {pending ? "Salvando..." : "Salvar forma de pagamento"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={buttonClasses("ghost")}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

// Desfaz o cancelamento antes do fim do período pago.
export function ReactivateForm({
  subscriptionId,
  nextCharge,
}: {
  subscriptionId: string;
  nextCharge: string;
}) {
  const [state, action, pending] = useActionState(
    reactivateSubscription,
    initial,
  );
  const [confirming, setConfirming] = useState(false);
  useResultToast(state);
  if (state.ok) return <FormAlert tone="sucesso">{state.message}</FormAlert>;
  if (!confirming)
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonClasses("primary")}
      >
        Desfazer cancelamento
      </button>
    );
  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <p className="text-[0.9375rem] text-muted">
        A assinatura volta a renovar. A próxima cobrança será em {nextCharge},
        quando o período atual termina. Nada é cobrado agora.
      </p>
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("primary")}
        >
          {pending ? "Reativando..." : "Confirmar reativação"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonClasses("ghost")}
        >
          Voltar
        </button>
      </div>
    </form>
  );
}
