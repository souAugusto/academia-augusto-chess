import type { NotificationItem } from "@/lib/data/notifications";
import { KIND_LABELS } from "@/lib/validation/notifications-labels";

const KIND_STYLE: Record<NotificationItem["kind"], string> = {
  info: "bg-surface-2 text-muted",
  aviso: "bg-danger/15 text-danger",
  novidade: "bg-accent/15 text-accent-text",
};

export function KindBadge({ kind }: { kind: NotificationItem["kind"] }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${KIND_STYLE[kind]}`}>
      {KIND_LABELS[kind]}
    </span>
  );
}

// "agora", "há 5 min", "há 3 h", "há 2 dias" ou a data.
export function timeAgo(iso: string, now = Date.now()): string {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `há ${days} ${days === 1 ? "dia" : "dias"}`;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}
