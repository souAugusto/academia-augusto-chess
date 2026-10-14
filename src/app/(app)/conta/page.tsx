import { getAccessStatus } from "@/lib/data/trial";
import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { CancelSubscription } from "@/components/account/CancelSubscription";
import { FormAlert } from "@/components/forms/Field";
import { StyleBadge } from "@/components/style/StyleBadge";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";
import {
  getGroupLinks,
  getMySubscriptions,
  METHOD_LABELS,
  STATUS_LABELS,
  type MySubscription,
} from "@/lib/data/billing";
import { getMyStyleHistory } from "@/lib/data/style";
import { formatLongDate } from "@/lib/format";
import { STYLES } from "@/lib/style/styles";
import { payPending } from "./actions";

export const metadata: Metadata = {
  title: "Minha conta",
};

function formatWhatsapp(digits: string): string {
  const local = digits.length > 11 ? digits.slice(-11) : digits;
  const ddd = local.slice(0, 2);
  const number = local.slice(2);
  return `(${ddd}) ${number.slice(0, -4)}-${number.slice(-4)}`;
}

function subscriptionRows(sub: MySubscription) {
  const end = sub.currentPeriodEnd
    ? formatLongDate(sub.currentPeriodEnd)
    : null;
  const rows = [
    { label: "Plano", value: sub.planName },
    {
      label: "Situação",
      value: sub.cancelAtPeriodEnd
        ? "Cancelada (sem renovação)"
        : STATUS_LABELS[sub.status],
    },
  ];
  if (sub.billingType)
    rows.push({ label: "Pagamento", value: METHOD_LABELS[sub.billingType] });
  if (end)
    rows.push({
      label: sub.cancelAtPeriodEnd ? "Acesso até" : "Próxima renovação",
      value: end,
    });
  if (sub.source === "manual")
    rows.push({ label: "Origem", value: "Concedido pela Finale" });
  return rows;
}

export default async function ContaPage({ searchParams }: PageProps<"/conta">) {
  const user = await requireUser("/conta");
  const [subscriptions, params, styles, access] = await Promise.all([
    getMySubscriptions(user.id),
    searchParams,
    getMyStyleHistory(user.id),
    getAccessStatus({ id: user.id, email: user.email }),
  ]);
  const currentStyle = styles[0];
  const groups = await getGroupLinks(user.planRank);
  const rows = [
    { label: "Nome", value: user.name },
    { label: "E-mail", value: user.email },
    {
      label: "WhatsApp",
      value: user.whatsapp ? formatWhatsapp(user.whatsapp) : "Não informado",
    },
    {
      label: "Acesso",
      value:
        access.kind === "teste"
          ? "Membro (teste grátis)"
          : (PLAN_NAMES[user.planRank] ?? "Nenhum plano ativo"),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Minha conta</SectionLabel>
        <h1 className="font-display text-page font-bold">Seus dados</h1>
      </div>
      <dl className="flex max-w-[640px] flex-col rounded-card border border-border bg-surface px-6">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-wrap justify-between gap-2 border-b border-border py-4 last:border-b-0"
          >
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-semibold break-all">{row.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-3">
        <Link href="/conta/perfil" className={buttonClasses("secondary")}>
          Editar perfil
        </Link>
        <Link href="/conta/aparencia" className={buttonClasses("secondary")}>
          Aparência do tabuleiro e sons
        </Link>
      </div>

      <section
        aria-labelledby="estilo"
        className="flex max-w-[640px] flex-col gap-4 rounded-card border border-border bg-surface p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="estilo" className="text-lg font-semibold">
            Estilo de jogo
          </h2>
          {currentStyle && <StyleBadge style={currentStyle.style} />}
        </div>
        {currentStyle ? (
          <>
            <p className="text-[0.9375rem] leading-relaxed text-muted">
              {STYLES[currentStyle.style].description}
            </p>
            {styles.length > 1 && (
              <ol
                className="flex flex-col gap-1 text-sm"
                aria-label="Histórico"
              >
                {styles.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3">
                    <span>{STYLES[item.style].name}</span>
                    <span className="text-muted">
                      {formatLongDate(item.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <Link
              href="/questionario?next=%2Fconta"
              className={buttonClasses("secondary", "md", "self-start")}
            >
              Refazer o questionário
            </Link>
          </>
        ) : (
          <>
            <FormAlert tone="sucesso">
              Faça seu questionário: em 2 minutos você descobre seu estilo de
              jogo.
            </FormAlert>
            <Link
              href="/questionario?next=%2Fconta"
              className={buttonClasses("primary", "md", "self-start")}
            >
              Fazer o questionário
            </Link>
          </>
        )}
      </section>

      <section
        aria-labelledby="assinatura"
        className="flex max-w-[640px] flex-col gap-4"
      >
        <h2 id="assinatura" className="text-lg font-semibold">
          Assinatura
        </h2>
        {params.pagamento === "indisponivel" && (
          <FormAlert tone="erro">
            Não encontramos uma cobrança em aberto agora. Tente de novo em
            instantes.
          </FormAlert>
        )}
        {access.kind === "teste" && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-card border p-5 ${access.daysLeft <= 7 ? "border-accent bg-surface-2" : "border-border bg-surface"}`}
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold">
                Teste grátis:{" "}
                {access.daysLeft === 1
                  ? "último dia"
                  : `${access.daysLeft} dias restantes`}
              </span>
              <span className="text-sm text-muted">
                Plano Membro até {formatLongDate(access.endsAt)}. Nada é cobrado
                ao fim.
              </span>
            </div>
            <Link
              href="/checkout?plano=membro"
              className={buttonClasses("primary")}
            >
              Assinar agora
            </Link>
          </div>
        )}
        {access.kind === "teste-expirado" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-5">
            <span className="text-[0.9375rem] text-muted">
              Seu teste grátis terminou em {formatLongDate(access.endsAt)}. Seu
              progresso continua guardado.
            </span>
            <Link
              href="/checkout?plano=membro"
              className={buttonClasses("primary")}
            >
              Assinar o Membro
            </Link>
          </div>
        )}
        {access.kind === "gratuito" && access.eligible && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-5">
            <span className="text-[0.9375rem] text-muted">
              Você pode testar o plano Membro por 30 dias, sem cartão.
            </span>
            <Link href="/teste-gratis" className={buttonClasses("secondary")}>
              Começar 30 dias grátis
            </Link>
          </div>
        )}
        {subscriptions.length === 0 && access.kind !== "teste" && (
          <p className="text-muted">Você ainda não tem assinatura.</p>
        )}
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6"
          >
            <dl className="flex flex-col">
              {subscriptionRows(sub).map((row) => (
                <div
                  key={row.label}
                  className="flex flex-wrap justify-between gap-2 border-b border-border py-3 last:border-b-0"
                >
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-3">
              {(sub.status === "incomplete" || sub.status === "past_due") &&
                sub.source === "asaas" &&
                !sub.cancelAtPeriodEnd && (
                  <form action={payPending}>
                    <input type="hidden" name="subscriptionId" value={sub.id} />
                    <button type="submit" className={buttonClasses("primary")}>
                      Pagar agora
                    </button>
                  </form>
                )}
              {sub.source === "asaas" && !sub.cancelAtPeriodEnd && (
                <CancelSubscription
                  subscriptionId={sub.id}
                  accessUntil={
                    sub.status === "incomplete" || !sub.currentPeriodEnd
                      ? null
                      : formatLongDate(sub.currentPeriodEnd)
                  }
                />
              )}
            </div>
          </div>
        ))}
      </section>

      {groups.length > 0 && (
        <section
          aria-labelledby="grupos"
          className="flex max-w-[640px] flex-col gap-3"
        >
          <h2 id="grupos" className="text-lg font-semibold">
            Grupos no WhatsApp
          </h2>
          <div className="flex flex-wrap gap-3">
            {groups.map((group) => (
              <a
                key={group.url}
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("outline-accent")}
              >
                {group.label}
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {user.planRank === 0 && (
          <Link href="/planos" className={buttonClasses("primary")}>
            Escolher plano
          </Link>
        )}
        <Link href="/recuperar-senha" className={buttonClasses("secondary")}>
          Trocar senha
        </Link>
        <form action={signOut}>
          <button type="submit" className={buttonClasses("secondary")}>
            Sair
          </button>
        </form>
      </div>
    </>
  );
}
