import type { Metadata } from "next";
import {
  AdminForm,
  AdminInput,
  AdminSelect,
} from "@/components/admin/AdminForm";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { formatLiveDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { createLive, deleteLive, saveSettings } from "./actions";

export const metadata: Metadata = { title: "Lives e grupos" };

const AUDIENCE: Record<string, string> = {
  public: "Aberta",
  membro: "Assinantes",
  intensivo: "Só Intensivo",
};

// Mostra também as lives das últimas 24 horas.
function sinceYesterday(): string {
  return new Date(Date.now() - 86_400_000).toISOString();
}

export default async function ConfiguracoesAdminPage() {
  await requireAdmin("/admin/configuracoes");
  const supabase = await createClient();
  const [{ data: settings }, { data: lives }] = await Promise.all([
    supabase.from("app_settings").select("key, value"),
    supabase
      .from("live_events")
      .select("id, title, starts_at, url, audience")
      .gte("starts_at", sinceYesterday())
      .order("starts_at"),
  ]);
  const setting = (key: string) =>
    settings?.find((row) => row.key === key)?.value ?? "";

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Lives e grupos
        </h1>
      </div>

      <Card className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Grupos do WhatsApp</h2>
        <p className="text-sm text-muted">
          Os links aparecem só para quem tem o plano.
        </p>
        <AdminForm action={saveSettings} submitLabel="Salvar links">
          <AdminInput
            name="whatsapp_membros_url"
            label="Grupo dos membros"
            defaultValue={setting("whatsapp_membros_url")}
            placeholder="https://chat.whatsapp.com/..."
          />
          <AdminInput
            name="whatsapp_intensivo_url"
            label="Grupo da turma do Intensivo"
            defaultValue={setting("whatsapp_intensivo_url")}
            placeholder="https://chat.whatsapp.com/..."
          />
        </AdminForm>
      </Card>

      <section className="flex flex-col gap-4" aria-labelledby="lives">
        <h2 id="lives" className="text-lg font-semibold">
          Próximas lives
        </h2>
        <ul className="flex flex-col gap-2">
          {(lives ?? []).map((live) => (
            <li
              key={live.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="font-semibold">{live.title}</span>
                <span className="text-sm text-muted">
                  {formatLiveDate(new Date(live.starts_at))} ·{" "}
                  {AUDIENCE[live.audience]}
                </span>
              </div>
              <AdminForm
                action={deleteLive}
                submitLabel="Apagar"
                pendingLabel="Apagando..."
                variant="ghost"
                confirm="Apagar esta live?"
              >
                <input type="hidden" name="id" value={live.id} />
              </AdminForm>
            </li>
          ))}
          {(lives ?? []).length === 0 && (
            <p className="text-muted">Nenhuma live agendada.</p>
          )}
        </ul>
        <Card className="flex max-w-2xl flex-col gap-4">
          <h3 className="font-semibold">Agendar live</h3>
          <AdminForm action={createLive} submitLabel="Agendar">
            <AdminInput name="title" label="Título" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminInput
                name="startsAt"
                label="Data e hora (Brasília)"
                type="datetime-local"
                required
              />
              <AdminSelect
                name="audience"
                label="Quem pode ver"
                defaultValue="public"
                options={Object.entries(AUDIENCE).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </div>
            <AdminInput
              name="url"
              label="Link da live (opcional)"
              placeholder="https://..."
            />
          </AdminForm>
        </Card>
      </section>
    </>
  );
}
