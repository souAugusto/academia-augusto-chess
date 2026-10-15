"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  checkNickname,
  setNickname,
  updateProfile,
} from "@/app/(app)/conta/perfil/actions";
import { Field } from "@/components/forms/Field";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";

type Values = {
  name: string;
  nickname: string;
  location: string;
  bio: string;
  declaredRating: string;
  whatsapp: string;
  showInRanking: boolean;
};

// Dados do perfil. Salva só o que mudou; o botão fica desligado sem mudança.
export function ProfileForm({
  initial,
  nicknameHint,
}: {
  initial: Values;
  nicknameHint: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [nickCheck, setNickCheck] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();
  const timer = useRef<number | null>(null);

  const dirty = (Object.keys(values) as (keyof Values)[]).some(
    (key) => values[key] !== saved[key],
  );
  const nicknameChanged = values.nickname.trim() !== saved.nickname;

  // Apelido conferido enquanto digita (com uma pequena pausa).
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    const value = values.nickname.trim();
    if (!nicknameChanged || value === "") return;
    timer.current = window.setTimeout(async () => {
      setNickCheck(await checkNickname(value));
    }, 450);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [values.nickname, nicknameChanged]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (key === "nickname") setNickCheck(null);
  };

  function submit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const nextErrors: Record<string, string | undefined> = {};
      let ok = true;
      if (nicknameChanged) {
        const data = new FormData();
        data.set("nickname", values.nickname.trim());
        const result = await setNickname({}, data);
        if (!result.ok) {
          ok = false;
          nextErrors.nickname = result.errors?.nickname ?? result.message;
        }
      }
      const otherChanged = (Object.keys(values) as (keyof Values)[]).some(
        (key) => key !== "nickname" && values[key] !== saved[key],
      );
      if (otherChanged) {
        const data = new FormData();
        data.set("name", values.name);
        data.set("bio", values.bio);
        data.set("location", values.location);
        data.set("declaredRating", values.declaredRating);
        data.set("whatsapp", values.whatsapp);
        if (values.showInRanking) data.set("showInRanking", "on");
        const result = await updateProfile({}, data);
        if (!result.ok) {
          ok = false;
          Object.assign(nextErrors, result.errors ?? {});
          if (result.message && !result.errors) toast("erro", result.message);
        }
      }
      setErrors(nextErrors);
      if (ok) {
        setSaved({ ...values, nickname: values.nickname.trim() });
        setNickCheck(null);
        toast("sucesso", "Perfil salvo.");
        router.refresh();
      } else if (Object.keys(nextErrors).length) {
        toast("erro", "Confira os campos destacados.");
      }
    });
  }

  const nickError =
    errors.nickname ??
    (nickCheck && !nickCheck.ok ? nickCheck.message : undefined);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          id="name"
          label="Nome de exibição"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          autoComplete="name"
          maxLength={80}
          error={errors.name}
          hint="Aparece no seu painel. Não aparece no ranking."
        />
        <Field
          id="nickname"
          label="Nome de usuário (apelido)"
          value={values.nickname}
          onChange={(e) => set("nickname", e.target.value)}
          autoComplete="nickname"
          maxLength={20}
          error={nickError}
          hint={
            nicknameChanged && nickCheck?.ok ? (
              <span className="text-success">{nickCheck.message}</span>
            ) : (
              nicknameHint
            )
          }
        />
        <Field
          id="location"
          label="Cidade e país (opcional)"
          value={values.location}
          onChange={(e) => set("location", e.target.value)}
          autoComplete="address-level2"
          maxLength={80}
          placeholder="Ex.: Porto Alegre, Brasil"
          error={errors.location}
        />
        <Field
          id="declaredRating"
          label="Seu rating em partidas (opcional)"
          value={values.declaredRating}
          onChange={(e) =>
            set("declaredRating", e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          inputMode="numeric"
          placeholder="Ex.: 1500"
          error={errors.declaredRating}
          hint="De 100 a 3500. Só para você acompanhar."
        />
        <Field
          id="whatsapp"
          label="WhatsApp (opcional)"
          value={values.whatsapp}
          onChange={(e) => set("whatsapp", e.target.value)}
          inputMode="tel"
          autoComplete="tel"
          error={errors.whatsapp}
          hint="Privado. Com DDD, ex.: (51) 99999-9999."
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-semibold">
          Bio (opcional)
        </label>
        <textarea
          id="bio"
          rows={3}
          maxLength={160}
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
          aria-describedby="bio-dica"
          aria-invalid={errors.bio ? true : undefined}
          className="rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text focus:outline-2 focus:outline-offset-1 focus:outline-accent aria-invalid:border-danger"
        />
        <span id="bio-dica" className="text-[0.8125rem] text-muted">
          {values.bio.length}/160. Texto simples. Por enquanto, só você vê.
        </span>
        {errors.bio && (
          <span className="text-sm text-danger">{errors.bio}</span>
        )}
      </div>
      <label className="flex min-h-touch items-start gap-3 text-[0.9375rem]">
        <input
          type="checkbox"
          checked={values.showInRanking}
          onChange={(e) => set("showInRanking", e.target.checked)}
          className="mt-1 size-5 accent-[var(--accent)]"
        />
        <span>
          Aparecer no ranking
          <span className="block text-[0.8125rem] text-muted">
            Mostra só apelido, foto, título e rating tático. Nunca nome, e-mail
            ou WhatsApp.
          </span>
        </span>
      </label>
      <div>
        <button
          type="submit"
          disabled={!dirty || pending}
          className={buttonClasses("primary")}
        >
          {pending ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>
    </form>
  );
}
