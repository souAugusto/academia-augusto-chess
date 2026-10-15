"use client";

import { useActionState, useState } from "react";
import {
  cancelSubscription,
  type CancelState,
} from "@/app/(app)/conta/actions";
import { FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";

const initial: CancelState = {};

// Cancelamento em dois passos, para não cancelar por um toque sem querer.
export function CancelSubscription({
  subscriptionId,
  accessUntil,
}: {
  subscriptionId: string;
  accessUntil: string | null;
}) {
  const [state, action, pending] = useActionState(cancelSubscription, initial);
  const [confirming, setConfirming] = useState(false);

  if (state.done)
    return (
      <FormAlert tone="sucesso">
        Renovação cancelada.{" "}
        {accessUntil ? `Seu acesso continua até ${accessUntil}.` : ""}
      </FormAlert>
    );

  if (!confirming)
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonClasses("secondary")}
      >
        Cancelar assinatura
      </button>
    );

  return (
    <form action={action} className="flex flex-col gap-3">
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <p className="text-[0.9375rem] leading-relaxed text-muted">
        Nenhuma cobrança nova será feita.{" "}
        {accessUntil
          ? `Você continua com acesso até ${accessUntil} e pode desfazer o cancelamento aqui mesmo até essa data.`
          : "O acesso termina agora, porque o primeiro pagamento não foi feito."}
      </p>
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses("primary")}
        >
          {pending ? "Cancelando..." : "Confirmar cancelamento"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className={buttonClasses("secondary")}
        >
          Manter assinatura
        </button>
      </div>
    </form>
  );
}
