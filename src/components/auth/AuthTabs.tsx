"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { login, signup, type FormState } from "@/app/(auth)/actions";
import { Field, FormAlert } from "@/components/forms/Field";
import { SubmitButton } from "@/components/forms/SubmitButton";

export type AuthTab = "entrar" | "criar";

type AuthTabsProps = {
  initialTab: AuthTab;
  next: string;
  notice?: string; // aviso vindo da URL (ex.: link expirado)
};

const initial: FormState = {};

export function AuthTabs({ initialTab, next, notice }: AuthTabsProps) {
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const baseId = useId();
  const tabs: { id: AuthTab; label: string }[] = [
    { id: "entrar", label: "Entrar" },
    { id: "criar", label: "Criar conta" },
  ];

  return (
    <>
      <div
        role="tablist"
        aria-label="Acesso"
        className="flex gap-1 rounded-control border border-border bg-surface p-1"
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-${item.id}-aba`}
              aria-selected={selected}
              aria-controls={`${baseId}-${item.id}-painel`}
              onClick={() => setTab(item.id)}
              className={`min-h-touch flex-1 rounded-[0.5625rem] px-3 py-3 text-[0.9375rem] font-bold ${
                selected
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:text-text"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {notice && <FormAlert tone="erro">{notice}</FormAlert>}

      <div
        role="tabpanel"
        id={`${baseId}-${tab}-painel`}
        aria-labelledby={`${baseId}-${tab}-aba`}
      >
        {tab === "entrar" ? (
          <LoginForm next={next} />
        ) : (
          <SignupForm next={next} />
        )}
      </div>
    </>
  );
}

function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, initial);
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[1.875rem] font-bold">
          Bem-vindo de volta
        </h2>
        <p className="text-[0.9375rem] text-muted">
          Entre com o e-mail da sua assinatura.
        </p>
      </div>
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <input type="hidden" name="next" value={next} />
      <Field
        id="email-login"
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@email.com"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />
      <Field
        id="senha-login"
        name="password"
        type="password"
        label="Senha"
        placeholder="Sua senha"
        autoComplete="current-password"
        required
        error={state.errors?.password}
        labelAside={
          <Link
            href="/recuperar-senha"
            className="text-[0.8125rem] text-accent-text underline-offset-4 hover:underline"
          >
            Esqueci minha senha
          </Link>
        }
      />
      <SubmitButton pendingText="Entrando...">Entrar</SubmitButton>
    </form>
  );
}

function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signup, initial);
  if (state.success) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="font-display text-[1.875rem] font-bold">
          Confira seu e-mail
        </h2>
        <FormAlert tone="sucesso">{state.success}</FormAlert>
        <p className="text-sm text-muted">
          Não chegou? Veja a caixa de spam ou tente criar a conta de novo em
          alguns minutos.
        </p>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[1.875rem] font-bold">
          Criar sua conta
        </h2>
        <p className="text-[0.9375rem] text-muted">
          Depois do cadastro, você escolhe o plano e finaliza o pagamento.
        </p>
      </div>
      {state.message && <FormAlert tone="erro">{state.message}</FormAlert>}
      <Field
        id="nome"
        name="name"
        label="Nome"
        placeholder="Como quer ser chamado"
        autoComplete="name"
        required
        maxLength={80}
        defaultValue={state.values?.name}
        error={state.errors?.name}
      />
      <Field
        id="email-cad"
        name="email"
        type="email"
        label="E-mail"
        placeholder="voce@email.com"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.errors?.email}
      />
      <Field
        id="whats"
        name="whatsapp"
        type="tel"
        label="WhatsApp (opcional)"
        placeholder="(51) 90000-0000"
        autoComplete="tel-national"
        inputMode="tel"
        defaultValue={state.values?.whatsapp}
        error={state.errors?.whatsapp}
        hint="Usado para avisos da sua turma e do grupo de membros."
      />
      <Field
        id="senha-cad"
        name="password"
        type="password"
        label="Senha"
        placeholder="Mínimo de 8 caracteres"
        autoComplete="new-password"
        required
        minLength={8}
        error={state.errors?.password}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2.5">
          <input
            id="termos"
            name="terms"
            type="checkbox"
            required
            aria-invalid={state.errors?.terms ? true : undefined}
            aria-describedby={state.errors?.terms ? "termos-erro" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-accent"
          />
          <label htmlFor="termos" className="text-sm leading-normal text-muted">
            Li e aceito os{" "}
            <Link
              href="/termos"
              target="_blank"
              className="text-accent-text underline underline-offset-4"
            >
              Termos de uso
            </Link>{" "}
            e a{" "}
            <Link
              href="/privacidade"
              target="_blank"
              className="text-accent-text underline underline-offset-4"
            >
              Política de privacidade
            </Link>
            .
          </label>
        </div>
        {state.errors?.terms && (
          <span id="termos-erro" className="text-sm text-danger">
            {state.errors.terms}
          </span>
        )}
      </div>
      <SubmitButton pendingText="Criando conta...">
        Criar conta e escolher plano
      </SubmitButton>
    </form>
  );
}
