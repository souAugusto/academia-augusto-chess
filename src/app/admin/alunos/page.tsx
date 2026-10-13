import type { Metadata } from "next";
import {
  AdminForm,
  AdminInput,
  AdminSelect,
} from "@/components/admin/AdminForm";
import { StyleBadge } from "@/components/style/StyleBadge";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { METHOD_LABELS, STATUS_LABELS } from "@/lib/data/billing";
import { formatLongDate } from "@/lib/format";
import type { SubscriptionStatus } from "@/lib/payments/rules";
import type { ResultStyle } from "@/lib/style/styles";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantPlan, revokeGrant, stopRenewal } from "./actions";

export const metadata: Metadata = { title: "Alunos" };

type Sub = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  source: string;
  billing_type: "PIX" | "CREDIT_CARD" | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

const PLAN_LABEL: Record<string, string> = {
  membro: "Membro",
  intensivo: "Intensivo",
};

function describe(sub: Sub): string {
  const parts = [
    PLAN_LABEL[sub.plan_id] ?? sub.plan_id,
    sub.source === "manual"
      ? "concedido"
      : (METHOD_LABELS[sub.billing_type ?? "PIX"] ?? ""),
    sub.cancel_at_period_end
      ? "sem renovação"
      : STATUS_LABELS[sub.status as SubscriptionStatus],
  ];
  if (sub.current_period_end)
    parts.push(`até ${formatLongDate(new Date(sub.current_period_end))}`);
  return parts.join(" · ");
}

export default async function AlunosPage({
  searchParams,
}: PageProps<"/admin/alunos">) {
  await requireAdmin("/admin/alunos");
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.trim().toLowerCase() : "";

  const admin = createAdminClient();
  const [
    { data: list },
    { data: profiles },
    { data: subs },
    { data: admins },
    { data: styles },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from("profiles").select("id, name, whatsapp, created_at"),
    admin
      .from("subscriptions")
      .select(
        "id, user_id, plan_id, status, source, billing_type, current_period_end, cancel_at_period_end",
      )
      .in("status", ["active", "trialing", "past_due", "incomplete"]),
    admin.from("admins").select("user_id"),
    admin.from("player_styles").select("user_id, style"),
  ]);
  const styleById = new Map(
    (styles ?? []).map((row) => [row.user_id, row.style as ResultStyle]),
  );

  const profileById = new Map((profiles ?? []).map((row) => [row.id, row]));
  const adminIds = new Set((admins ?? []).map((row) => row.user_id));
  const users = (list?.users ?? [])
    .map((user) => ({
      id: user.id,
      email: user.email ?? "",
      name: profileById.get(user.id)?.name ?? "",
      whatsapp: profileById.get(user.id)?.whatsapp ?? null,
      createdAt: new Date(user.created_at),
      subs: ((subs ?? []) as Sub[]).filter((sub) => sub.user_id === user.id),
    }))
    .filter(
      (user) =>
        !search ||
        user.email.toLowerCase().includes(search) ||
        user.name.toLowerCase().includes(search),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Alunos
        </h1>
        <p className="max-w-2xl text-muted">
          Contas, assinaturas e concessão manual de acesso (para quem pagou por
          fora, bolsas ou a equipe).
        </p>
      </div>

      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="busca" className="sr-only">
          Buscar por nome ou e-mail
        </label>
        <input
          id="busca"
          name="q"
          defaultValue={search}
          placeholder="Buscar por nome ou e-mail"
          className="min-h-touch flex-1 rounded-control border border-border-strong bg-surface px-3 text-base"
        />
        <button
          type="submit"
          className="min-h-touch rounded-control border border-border-strong px-4 font-semibold"
        >
          Buscar
        </button>
      </form>

      <p className="text-sm text-muted">{users.length} conta(s).</p>
      <ul className="flex flex-col gap-4">
        {users.map((user) => {
          const manual = user.subs.find((sub) => sub.source === "manual");
          return (
            <li key={user.id}>
              <Card className="flex flex-col gap-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {user.name || "(sem nome)"}
                      {adminIds.has(user.id) && (
                        <span className="ml-2 text-xs text-accent-text">
                          admin
                        </span>
                      )}
                      {styleById.has(user.id) && (
                        <span className="ml-2 align-middle">
                          <StyleBadge
                            style={styleById.get(user.id)!}
                            size="sm"
                          />
                        </span>
                      )}
                    </span>
                    <span className="text-sm break-all text-muted">
                      {user.email}
                      {user.whatsapp && ` · WhatsApp ${user.whatsapp}`}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    Conta criada em {formatLongDate(user.createdAt)}
                  </span>
                </div>

                {user.subs.length === 0 ? (
                  <p className="text-sm text-muted">Sem assinatura.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {user.subs.map((sub) => (
                      <li
                        key={sub.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2 text-sm"
                      >
                        <span>{describe(sub)}</span>
                        {sub.source === "manual" ? (
                          <AdminForm
                            action={revokeGrant}
                            submitLabel="Encerrar concessão"
                            pendingLabel="Encerrando..."
                            variant="secondary"
                            confirm="Encerrar o acesso concedido agora?"
                            className="flex flex-wrap items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="subscriptionId"
                              value={sub.id}
                            />
                          </AdminForm>
                        ) : (
                          !sub.cancel_at_period_end && (
                            <AdminForm
                              action={stopRenewal}
                              submitLabel="Cancelar renovação"
                              pendingLabel="Cancelando..."
                              variant="secondary"
                              confirm="Parar as cobranças deste aluno? Ele mantém o acesso até o fim do mês pago."
                              className="flex flex-wrap items-center gap-2"
                            >
                              <input
                                type="hidden"
                                name="subscriptionId"
                                value={sub.id}
                              />
                            </AdminForm>
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <details>
                  <summary className="cursor-pointer text-sm font-semibold text-accent-text">
                    {manual
                      ? "Alterar concessão manual"
                      : "Conceder acesso manual"}
                  </summary>
                  <AdminForm
                    action={grantPlan}
                    submitLabel="Conceder"
                    className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <AdminSelect
                      id={`plano-${user.id}`}
                      name="planId"
                      label="Plano"
                      defaultValue={manual?.plan_id ?? "membro"}
                      options={[
                        { value: "membro", label: "Membro" },
                        { value: "intensivo", label: "Intensivo" },
                      ]}
                    />
                    <AdminInput
                      id={`ate-${user.id}`}
                      name="until"
                      type="date"
                      label="Até (vazio = sem prazo)"
                    />
                  </AdminForm>
                </details>
              </Card>
            </li>
          );
        })}
      </ul>
    </>
  );
}
