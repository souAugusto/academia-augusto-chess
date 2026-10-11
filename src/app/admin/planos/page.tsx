import type { Metadata } from "next";
import { AdminForm, AdminInput } from "@/components/admin/AdminForm";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { getIntensivoSeatsLeft, getPlans } from "@/lib/data/public";
import { formatLongDate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { removeFromWaitlist, updatePlan } from "./actions";

export const metadata: Metadata = { title: "Planos e vagas" };

export default async function PlanosAdminPage() {
  await requireAdmin("/admin/planos");
  const [plans, seatsLeft, { data: waitlist }] = await Promise.all([
    getPlans(),
    getIntensivoSeatsLeft(),
    createAdminClient()
      .from("waitlist")
      .select("id, email, created_at")
      .order("created_at"),
  ]);

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Planos e vagas
        </h1>
        <p className="max-w-2xl text-muted">
          Um preço novo vale só para quem assinar depois da mudança. Quem já
          assina continua pagando o valor antigo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            {plan.seatLimit !== null && (
              <p className="text-sm text-muted">
                Vagas livres agora: {seatsLeft} de {plan.seatLimit}.
              </p>
            )}
            <AdminForm action={updatePlan} submitLabel="Salvar">
              <input type="hidden" name="id" value={plan.id} />
              <AdminInput
                id={`preco-${plan.id}`}
                name="priceReais"
                label="Preço por mês (R$)"
                type="number"
                step="0.01"
                min="1"
                defaultValue={(plan.priceCents / 100).toFixed(2)}
                required
              />
              <AdminInput
                id={`vagas-${plan.id}`}
                name="seatLimit"
                label="Limite de vagas"
                type="number"
                min="1"
                defaultValue={plan.seatLimit ?? ""}
                hint="Vazio = sem limite."
              />
            </AdminForm>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="espera">
        <h2 id="espera" className="text-lg font-semibold">
          Lista de espera do Intensivo ({waitlist?.length ?? 0})
        </h2>
        {(waitlist ?? []).length === 0 ? (
          <p className="text-muted">Ninguém na lista.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(waitlist ?? []).map((entry, index) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-surface px-4 py-2"
              >
                <span className="break-all">
                  {index + 1}. {entry.email}{" "}
                  <span className="text-sm text-muted">
                    · desde {formatLongDate(new Date(entry.created_at))}
                  </span>
                </span>
                <AdminForm
                  action={removeFromWaitlist}
                  submitLabel="Remover"
                  pendingLabel="Removendo..."
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <input type="hidden" name="id" value={entry.id} />
                </AdminForm>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
