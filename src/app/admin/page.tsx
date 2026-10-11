import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { getIntensivoSeatsLeft, getPlans } from "@/lib/data/public";
import { formatPriceBRL } from "@/lib/format";
import { paymentsConfigured } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHome() {
  await requireAdmin();
  const admin = createAdminClient();
  const [
    plans,
    seatsLeft,
    { data: subs },
    { count: students },
    { count: waiting },
  ] = await Promise.all([
    getPlans(),
    getIntensivoSeatsLeft(),
    admin
      .from("subscriptions")
      .select("plan_id, status, source, cancel_at_period_end")
      .in("status", ["active", "past_due", "incomplete"]),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("waitlist").select("id", { count: "exact", head: true }),
  ]);

  const rows = subs ?? [];
  const paying = rows.filter(
    (row) => row.source === "asaas" && row.status !== "incomplete",
  );
  const monthly = paying
    .filter((row) => !row.cancel_at_period_end)
    .reduce(
      (sum, row) =>
        sum + (plans.find((plan) => plan.id === row.plan_id)?.priceCents ?? 0),
      0,
    );
  const intensivo = plans.find((plan) => plan.id === "intensivo");

  const stats = [
    { label: "Contas criadas", value: String(students ?? 0) },
    {
      label: "Membros pagantes",
      value: String(paying.filter((row) => row.plan_id === "membro").length),
    },
    {
      label: "Intensivo pagantes",
      value: String(paying.filter((row) => row.plan_id === "intensivo").length),
    },
    {
      label: "Vagas livres no Intensivo",
      value: intensivo?.seatLimit
        ? `${seatsLeft} de ${intensivo.seatLimit}`
        : "Sem limite",
    },
    { label: "Receita mensal prevista", value: formatPriceBRL(monthly) },
    {
      label: "Em atraso",
      value: String(rows.filter((row) => row.status === "past_due").length),
    },
    {
      label: "Checkout sem pagamento",
      value: String(rows.filter((row) => row.status === "incomplete").length),
    },
    { label: "Lista de espera", value: String(waiting ?? 0) },
  ];

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Visão geral
        </h1>
        {!paymentsConfigured() && (
          <p className="text-sm text-danger">
            Pagamento ainda não configurado (falta ASAAS_API_KEY).
          </p>
        )}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Card className="flex h-full flex-col gap-1.5">
              <span className="text-sm text-muted">{stat.label}</span>
              <span className="font-display text-3xl font-semibold">
                {stat.value}
              </span>
            </Card>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted">
        Receita prevista: soma das assinaturas pagas que vão renovar. Concessões
        manuais não entram. Detalhes por aluno em{" "}
        <Link href="/admin/alunos" className="text-accent-text hover:underline">
          Alunos
        </Link>
        .
      </p>
    </>
  );
}
