import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";

export const metadata: Metadata = {
  title: "Minha conta",
};

function formatWhatsapp(digits: string): string {
  const local = digits.length > 11 ? digits.slice(-11) : digits;
  const ddd = local.slice(0, 2);
  const number = local.slice(2);
  return `(${ddd}) ${number.slice(0, -4)}-${number.slice(-4)}`;
}

// Fase 1: dados da conta e sair. Assinatura, convite do WhatsApp e exclusão de
// conta entram na Fase 3.
export default async function ContaPage() {
  const user = await requireUser("/conta");
  const rows = [
    { label: "Nome", value: user.name },
    { label: "E-mail", value: user.email },
    {
      label: "WhatsApp",
      value: user.whatsapp ? formatWhatsapp(user.whatsapp) : "Não informado",
    },
    {
      label: "Plano",
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
