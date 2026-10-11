import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { CancelSubscription } from "@/components/account/CancelSubscription";
import { FormAlert } from "@/components/forms/Field";
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
import { formatLongDate } from "@/lib/format";
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
  const [user, subscriptions, params] = await Promise.all([
    requireUser("/conta"),
    getMySubscriptions(),
    searchParams,
  ]);
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
      value: PLAN_NAMES[user.planRank] ?? "Nenhum plano ativo",
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
        {subscriptions.length === 0 && (
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
