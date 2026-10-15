"use client";

import { useActionState, useState } from "react";
import {
  deleteAccount,
  type ProfileState,
} from "@/app/(app)/conta/perfil/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { DELETE_CONFIRM_WORD } from "@/lib/validation/profile";

const initial: ProfileState = {};

// Excluir conta em duas etapas: abrir e digitar EXCLUIR.
export function DeleteAccountForm({ renewing }: { renewing: boolean }) {
  const [state, action, pending] = useActionState(deleteAccount, initial);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex list-disc flex-col gap-1 pl-5 text-[0.9375rem] text-muted">
        <li>Apaga sua conta, foto, perfil e preferências.</li>
        <li>
          Apaga o progresso: rating, títulos, sequência, lições, partidas
          importadas e análises.
        </li>
        <li>Não dá para desfazer.</li>
      </ul>
      {renewing && (
        <FormAlert tone="erro">
          Você tem uma assinatura com renovação ativa. Cancele a assinatura na
          seção Assinatura antes de excluir a conta.
        </FormAlert>
      )}
      {!open ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={renewing}
            className={buttonClasses(
              "secondary",
              "md",
              "border-danger text-danger",
            )}
          >
            Excluir minha conta
          </button>
        </div>
      ) : (
        <form action={action} noValidate className="flex flex-col gap-4">
          <Field
            id="confirm-excluir"
            name="confirm"
            label={`Para confirmar, digite ${DELETE_CONFIRM_WORD}`}
            autoComplete="off"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            error={state.errors?.confirm}
          />
          {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={typed.trim() !== DELETE_CONFIRM_WORD || pending}
              className={buttonClasses(
                "secondary",
                "md",
                "border-danger text-danger",
              )}
            >
              {pending ? "Excluindo..." : "Excluir conta para sempre"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
              className={buttonClasses("ghost")}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
