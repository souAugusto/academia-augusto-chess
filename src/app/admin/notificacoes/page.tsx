import type { Metadata } from "next";
import {
  AdminForm,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  AUDIENCE_LABELS,
  KIND_LABELS,
  MAX_BODY,
  MAX_TITLE,
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_KINDS,
} from "@/lib/validation/notifications";
import {
  createNotification,
  deleteNotification,
  updateNotification,
} from "./actions";

export const metadata: Metadata = { title: "Notificações" };

type Row = {
  id: string;
  title: string;
  body: string;
  kind: keyof typeof KIND_LABELS;
  link: string | null;
  audience: keyof typeof AUDIENCE_LABELS;
  target_user: string | null;
  created_at: string;
  expires_at: string | null;
};

const kindOptions = NOTIFICATION_KINDS.map((value) => ({
  value,
  label: KIND_LABELS[value],
}));
const audienceOptions = NOTIFICATION_AUDIENCES.map((value) => ({
  value,
  label: AUDIENCE_LABELS[value],
}));

// A página do admin é gerada a cada visita (dinâmica): "agora" é a hora do pedido.
const isPast = (iso: string) => new Date(iso).getTime() < Date.now();

// Data AAAA-MM-DD no horário de Brasília (para o campo de expiração).
const dayInSaoPaulo = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(iso),
  );

function Fields({ row, email }: { row?: Row; email?: string }) {
  return (
    <>
      <AdminInput
        label="Título"
        name="title"
        required
        maxLength={MAX_TITLE}
        defaultValue={row?.title}
        id={row ? `titulo-${row.id}` : undefined}
      />
      <AdminTextarea
        label="Mensagem"
        name="body"
        required
        maxLength={MAX_BODY}
        rows={4}
        defaultValue={row?.body}
        hint={`Texto simples, até ${MAX_BODY} caracteres. Quebras de linha são mantidas.`}
        id={row ? `mensagem-${row.id}` : undefined}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminSelect
          label="Tipo"
          name="kind"
          options={kindOptions}
          defaultValue={row?.kind ?? "info"}
          id={row ? `tipo-${row.id}` : undefined}
        />
        <AdminInput
          label="Link (opcional)"
          name="link"
          placeholder="/aulas ou https://..."
          defaultValue={row?.link ?? ""}
          hint="Página do site (começa com /) ou endereço https."
          id={row ? `link-${row.id}` : undefined}
        />
        <AdminSelect
          label="Quem recebe"
          name="audience"
          options={audienceOptions}
          defaultValue={row?.audience ?? "todos"}
          id={row ? `publico-${row.id}` : undefined}
        />
        <AdminInput
          label="E-mail do aluno (só para um aluno específico)"
          name="targetEmail"
          type="email"
          defaultValue={email ?? ""}
          id={row ? `email-${row.id}` : undefined}
        />
        <AdminInput
          label="Expira em (opcional)"
          name="expiresOn"
          type="date"
          defaultValue={row?.expires_at ? dayInSaoPaulo(row.expires_at) : ""}
          hint="Depois desse dia, some para os alunos."
          id={row ? `expira-${row.id}` : undefined}
        />
      </div>
    </>
  );
}

export default async function NotificacoesAdminPage() {
  await requireAdmin("/admin/notificacoes");
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select(
      "id, title, body, kind, link, audience, target_user, created_at, expires_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Row[];

  // Quantos leram cada uma (o admin lê todas as leituras pelo RLS).
  const reads = new Map<string, number>();
  if (rows.length) {
    const { data: readRows } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .in(
        "notification_id",
        rows.map((row) => row.id),
      );
    for (const r of readRows ?? [])
      reads.set(r.notification_id, (reads.get(r.notification_id) ?? 0) + 1);
  }
  // E-mail dos alunos de notificações individuais (para mostrar e editar).
  const emails = new Map<string, string>();
  if (rows.some((row) => row.target_user)) {
    const { data: users } = await createAdminClient().auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    for (const user of users?.users ?? [])
      if (user.email) emails.set(user.id, user.email);
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Comunicação</SectionLabel>
        <h1 className="font-display text-page font-semibold">Notificações</h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Avisos que aparecem no sino do app. Os alunos veem só os que são para
          eles (todos, o plano deles ou o próprio e-mail).
        </p>
      </div>

      <section className="flex flex-col gap-4 rounded-card border border-border bg-surface p-5">
        <h2 className="text-lg font-semibold">Nova notificação</h2>
        <AdminForm action={createNotification} submitLabel="Enviar" pendingLabel="Enviando...">
          <Fields />
        </AdminForm>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Enviadas</h2>
        {rows.length === 0 ? (
          <p className="text-muted">Nenhuma notificação enviada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const expired = row.expires_at && isPast(row.expires_at);
              const target = row.target_user ? emails.get(row.target_user) : undefined;
              return (
                <li
                  key={row.id}
                  className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="font-semibold">{row.title}</p>
                      <p className="text-sm text-muted">
                        {KIND_LABELS[row.kind]} · {AUDIENCE_LABELS[row.audience]}
                        {target && ` (${target})`} · {formatDate(row.created_at)}
                        {row.expires_at &&
                          ` · ${expired ? "expirou" : "expira"} em ${formatDate(row.expires_at)}`}
                      </p>
                    </div>
                    <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold tabular-nums">
                      {reads.get(row.id) ?? 0} leram
                    </span>
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed whitespace-pre-line">
                    {row.body}
                  </p>
                  <details className="rounded-control border border-border p-3">
                    <summary className="cursor-pointer font-semibold">Editar</summary>
                    <div className="mt-3">
                      <AdminForm action={updateNotification} submitLabel="Salvar">
                        <input type="hidden" name="id" value={row.id} />
                        <Fields row={row} email={target} />
                      </AdminForm>
                    </div>
                  </details>
                  <form action={deleteNotification}>
                    <input type="hidden" name="id" value={row.id} />
                    <button type="submit" className={buttonClasses("ghost", "md", "text-danger")}>
                      Excluir
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
