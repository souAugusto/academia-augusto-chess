import type { Metadata } from "next";
import Link from "next/link";
import { KindBadge, timeAgo } from "@/components/notifications/NotificationParts";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getMyNotifications } from "@/lib/data/notifications";
import { markAllReadForm, markReadForm } from "./actions";

export const metadata: Metadata = { title: "Notificações" };

// Histórico completo das notificações do aluno (mais recentes primeiro).
export default async function NotificacoesPage() {
  const user = await requireUser("/notificacoes");
  const feed = await getMyNotifications(user.id, 100);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Conta</SectionLabel>
          <h1 className="font-display text-page font-bold">Notificações</h1>
          <p className="text-muted">
            {feed.unread > 0
              ? `${feed.unread} não ${feed.unread === 1 ? "lida" : "lidas"}.`
              : "Tudo lido."}
          </p>
        </div>
        {feed.unread > 0 && (
          <form action={markAllReadForm}>
            <button type="submit" className={buttonClasses("secondary")}>
              Marcar todas como lidas
            </button>
          </form>
        )}
      </div>
      {feed.items.length === 0 ? (
        <p className="rounded-card border border-border bg-surface p-6 text-muted">
          Nenhuma notificação por enquanto. Avisos da Finale aparecem aqui e no
          sino do topo da página.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {feed.items.map((item) => (
            <li
              key={item.id}
              className={`flex flex-col gap-2 rounded-card border p-4 ${item.read ? "border-border bg-surface" : "border-accent/50 bg-accent/5"}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <KindBadge kind={item.kind} />
                <span>{timeAgo(item.createdAt)}</span>
                {!item.read && <span className="font-semibold text-accent-text">Não lida</span>}
              </div>
              <h2 className={`text-base ${item.read ? "font-semibold" : "font-bold"}`}>
                {item.title}
              </h2>
              <p className="leading-relaxed whitespace-pre-line">{item.body}</p>
              <div className="flex flex-wrap items-center gap-3">
                {item.link && (
                  <Link
                    href={item.link}
                    className="font-semibold text-accent-text underline-offset-4 hover:underline"
                    {...(item.link.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    Abrir
                  </Link>
                )}
                {!item.read && (
                  <form action={markReadForm}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className={buttonClasses("ghost", "md", "px-2")}>
                      Marcar como lida
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
