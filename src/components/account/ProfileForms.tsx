"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  changeEmail,
  deleteAccount,
  removeAvatar,
  setNickname,
  updateProfile,
  uploadAvatar,
  type ProfileState,
} from "@/app/(app)/conta/perfil/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { AVATAR_MAX_BYTES } from "@/lib/validation/profile";
import { Avatar } from "./Avatar";

const initial: ProfileState = {};

function Box({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex max-w-[640px] flex-col gap-4 rounded-card border border-border bg-surface p-6"
    >
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Status({ state }: { state: ProfileState }) {
  if (!state.message) return null;
  return (
    <FormAlert tone={state.ok ? "sucesso" : "erro"}>{state.message}</FormAlert>
  );
}

export function NicknameForm({
  nickname,
  nextChange,
}: {
  nickname: string | null;
  nextChange: string | null;
}) {
  const [state, action, pending] = useActionState(setNickname, initial);
  return (
    <Box id="apelido" title="Apelido">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <Field
          id="nickname"
          name="nickname"
          label="Nome de exibição"
          defaultValue={nickname ?? ""}
          autoComplete="nickname"
          minLength={3}
          maxLength={20}
          required
          error={state.errors?.nickname}
          hint={
            nextChange
              ? `Você poderá trocar de novo em ${nextChange}. Ajustar maiúsculas e minúsculas é livre.`
              : "3 a 20 caracteres: letras sem acento, números, _, . ou -. Aparece no ranking. Dá para trocar uma vez a cada 30 dias."
          }
        />
        <Status state={state} />
        <div>
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses("primary")}
          >
            {pending ? "Salvando..." : "Salvar apelido"}
          </button>
        </div>
      </form>
    </Box>
  );
}

export function AvatarForm({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  const [state, action, pending] = useActionState(uploadAvatar, initial);
  const [localError, setLocalError] = useState<string | null>(null);
  const [removeState, remove, removing] = useActionState(
    async () => removeAvatar(),
    initial,
  );
  const shown = removeState.ok && !state.ok ? null : url;
  return (
    <Box id="foto" title="Foto">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar url={shown} name={name} size={88} />
        <form
          action={action}
          className="flex min-w-0 flex-1 flex-col gap-3"
          noValidate
          onSubmit={(event) => {
            // Confere o tamanho antes de enviar (o servidor confere de novo).
            const input = event.currentTarget.elements.namedItem("avatar");
            const file =
              input instanceof HTMLInputElement ? input.files?.[0] : undefined;
            if (file && file.size > AVATAR_MAX_BYTES) {
              event.preventDefault();
              setLocalError("A imagem pode ter no máximo 2 MB.");
            } else setLocalError(null);
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="avatar" className="text-sm font-semibold">
              Enviar foto
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              aria-describedby="avatar-dica"
              aria-invalid={
                (localError ?? state.errors?.avatar) ? true : undefined
              }
              className="text-sm file:mr-3 file:rounded-control file:border file:border-border-strong file:bg-surface-2 file:px-3 file:py-2 file:text-text"
            />
            <span id="avatar-dica" className="text-[0.8125rem] text-muted">
              JPG, PNG ou WEBP de até 2 MB. A foto é recortada em quadrado e os
              dados escondidos da imagem (como localização) são apagados.
            </span>
            {(localError ?? state.errors?.avatar) && (
              <span className="text-sm text-danger" role="alert">
                {localError ?? state.errors?.avatar}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
              className={buttonClasses("primary")}
            >
              {pending ? "Enviando..." : "Enviar"}
            </button>
            {shown && (
              <button
                type="button"
                disabled={removing}
                onClick={() => remove()}
                className={buttonClasses("ghost")}
              >
                Remover foto
              </button>
            )}
          </div>
        </form>
      </div>
      <Status state={state.message ? state : removeState} />
    </Box>
  );
}

export function DetailsForm({
  name,
  bio,
  whatsapp,
  showInRanking,
}: {
  name: string;
  bio: string;
  whatsapp: string;
  showInRanking: boolean;
}) {
  const [state, action, pending] = useActionState(updateProfile, initial);
  const [bioLength, setBioLength] = useState(bio.length);
  return (
    <Box id="dados" title="Dados">
      <form action={action} className="flex flex-col gap-4" noValidate>
        <Field
          id="name"
          name="name"
          label="Nome"
          defaultValue={name}
          autoComplete="name"
          maxLength={80}
          error={state.errors?.name}
          hint="Privado: não aparece no ranking."
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="text-sm font-semibold">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={160}
            defaultValue={bio}
            onChange={(event) => setBioLength(event.target.value.length)}
            aria-describedby="bio-dica"
            aria-invalid={state.errors?.bio ? true : undefined}
            className="rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text focus:outline-2 focus:outline-offset-1 focus:outline-accent aria-invalid:border-danger"
          />
          <span id="bio-dica" className="text-[0.8125rem] text-muted">
            {bioLength}/160. Texto simples. Por enquanto, só você vê.
          </span>
          {state.errors?.bio && (
            <span className="text-sm text-danger">{state.errors.bio}</span>
          )}
        </div>
        <Field
          id="whatsapp"
          name="whatsapp"
          label="WhatsApp (opcional)"
          defaultValue={whatsapp}
          inputMode="tel"
          autoComplete="tel"
          error={state.errors?.whatsapp}
          hint="Privado. Com DDD, ex.: (51) 99999-9999."
        />
        <label className="flex min-h-touch items-start gap-3 text-[0.9375rem]">
          <input
            type="checkbox"
            name="showInRanking"
            defaultChecked={showInRanking}
            className="mt-1 size-5 accent-[var(--accent)]"
          />
          <span>
            Aparecer no ranking
            <span className="block text-[0.8125rem] text-muted">
              Mostra só apelido, foto, título e rating tático. Nunca nome,
              e-mail ou WhatsApp.
            </span>
          </span>
        </label>
        <Status state={state} />
        <div>
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses("primary")}
          >
            {pending ? "Salvando..." : "Salvar dados"}
          </button>
        </div>
      </form>
    </Box>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(changeEmail, initial);
  return (
    <Box id="email" title="E-mail e senha">
      <p className="text-[0.9375rem] text-muted">
        E-mail atual: <span className="font-semibold text-text">{email}</span>
      </p>
      <form action={action} className="flex flex-col gap-4" noValidate>
        <Field
          id="new-email"
          name="email"
          type="email"
          label="Novo e-mail"
          autoComplete="email"
          error={state.errors?.email}
          hint="Enviamos um link de confirmação. O e-mail só muda depois que você confirmar."
        />
        <Status state={state} />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className={buttonClasses("primary")}
          >
            {pending ? "Enviando..." : "Trocar e-mail"}
          </button>
          <a href="/recuperar-senha" className={buttonClasses("secondary")}>
            Trocar senha
          </a>
        </div>
      </form>
    </Box>
  );
}

export function DeleteAccountForm({ confirmWord }: { confirmWord: string }) {
  const [state, action, pending] = useActionState(deleteAccount, initial);
  const [open, setOpen] = useState(false);
  return (
    <Box id="excluir" title="Excluir conta">
      <p className="text-[0.9375rem] leading-relaxed text-muted">
        Apaga sua conta, foto, progresso, partidas e análises e cancela a
        assinatura. Não dá para desfazer.
      </p>
      {!open ? (
        <div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={buttonClasses("secondary", "md", "text-danger")}
          >
            Quero excluir minha conta
          </button>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4" noValidate>
          <Field
            id="confirm"
            name="confirm"
            label={`Para confirmar, digite: ${confirmWord}`}
            autoComplete="off"
            error={state.errors?.confirm}
          />
          <Status state={state} />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={pending}
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
              onClick={() => setOpen(false)}
              className={buttonClasses("ghost")}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Box>
  );
}
