"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotificationFeed,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(app)/notificacoes/actions";
import { IconBell } from "@/components/ui/icons";
import type { NotificationFeed, NotificationItem } from "@/lib/data/notifications";
import { playSound } from "@/lib/sound";
import { KindBadge, timeAgo } from "./NotificationParts";

// A cada minuto, só com a aba visível: uma chamada leve ao servidor (sem
// conexão aberta o tempo todo, que pesaria no celular).
const POLL_MS = 60_000;

// Sino do cabeçalho: contador de não lidas e painel com as últimas.
export function NotificationBell({ initial }: { initial: NotificationFeed }) {
  const [feed, setFeed] = useState(initial);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const lastUnread = useRef(initial.unread);

  const refresh = useCallback(async () => {
    const next = await getNotificationFeed().catch(() => null);
    if (!next) return;
    // Chegou notificação nova: som discreto (respeita as preferências de som).
    if (next.unread > lastUnread.current) playSound("notification");
    lastUnread.current = next.unread;
    setFeed(next);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function markLocal(ids: string[] | "all") {
    setFeed((current) => {
      const items = current.items.map((item) =>
        ids === "all" || ids.includes(item.id) ? { ...item, read: true } : item,
      );
      const unread =
        ids === "all"
          ? 0
          : Math.max(
              0,
              current.unread -
                current.items.filter((i) => !i.read && ids.includes(i.id)).length,
            );
      lastUnread.current = unread;
      return { unread, items };
    });
  }

  function openItem(item: NotificationItem) {
    if (!item.read) {
      markLocal([item.id]);
      void markNotificationRead(item.id);
    }
  }

  const label =
    feed.unread > 0
      ? `Notificações: ${feed.unread} não ${feed.unread === 1 ? "lida" : "lidas"}`
      : "Notificações";

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void refresh();
        }}
        aria-expanded={open}
        aria-controls="painel-notificacoes"
        aria-label={label}
        className="relative flex size-touch items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-text"
      >
        <IconBell className="size-5" />
        {feed.unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 flex min-w-4.5 items-center justify-center rounded-full bg-danger px-1 text-[10px] leading-4.5 font-bold text-white"
          >
            {feed.unread > 9 ? "9+" : feed.unread}
          </span>
        )}
      </button>
      {open && (
        <div
          id="painel-notificacoes"
          // Celular: largura da tela com margem; computador: preso ao sino.
          className="fixed inset-x-4 top-16 z-40 flex max-h-[70dvh] flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-88"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="font-semibold">Notificações</p>
            {feed.unread > 0 && (
              <button
                type="button"
                onClick={() => {
                  markLocal("all");
                  void markAllNotificationsRead();
                }}
                className="min-h-touch text-sm font-semibold text-accent-text hover:underline"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          {feed.items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {feed.items.map((item) => (
                <li key={item.id}>
                  <NotificationRow item={item} onOpen={() => openItem(item)} />
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/notificacoes"
            onClick={() => setOpen(false)}
            className="flex min-h-touch items-center justify-center border-t border-border text-sm font-semibold text-accent-text hover:bg-surface-2"
          >
            Ver todas
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: NotificationItem;
  onOpen: () => void;
}) {
  const content = (
    <span className="flex flex-col gap-1 text-left">
      <span className="flex items-center gap-2">
        {!item.read && (
          <span className="size-2 shrink-0 rounded-full bg-accent" aria-label="Não lida" />
        )}
        <span className={`text-[0.9375rem] ${item.read ? "" : "font-semibold"}`}>
          {item.title}
        </span>
      </span>
      <span className="line-clamp-3 text-sm whitespace-pre-line text-muted">
        {item.body}
      </span>
      <span className="flex items-center gap-2 text-xs text-muted">
        <KindBadge kind={item.kind} /> {timeAgo(item.createdAt)}
      </span>
    </span>
  );
  const className = `block w-full px-4 py-3 transition hover:bg-surface-2 ${item.read ? "" : "bg-accent/5"}`;
  return item.link ? (
    <Link
      href={item.link}
      onClick={onOpen}
      className={className}
      {...(item.link.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onOpen} className={className}>
      {content}
    </button>
  );
}
