"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/(auth)/actions";
import { Avatar } from "@/components/account/Avatar";
import { IconGear, IconLogout, IconUser } from "@/components/ui/icons";

const item =
  "flex min-h-touch w-full items-center gap-3 rounded-control px-3 text-left text-[0.9375rem] text-text transition hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none";

// Foto no cabeçalho que abre um menu curto: Minha conta, Preferências e Sair.
export function AccountMenu({
  url,
  name,
  email,
}: {
  url: string | null;
  name: string;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>("a, button[type=submit]")?.focus();
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="menu-conta"
        aria-label="Abrir menu da conta"
        className="flex size-touch items-center justify-center rounded-full transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Avatar url={url} name={name} size={32} decorative />
      </button>
      {open && (
        <div
          id="menu-conta"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-card border border-border bg-surface p-2 shadow-card"
        >
          <div className="border-b border-border px-3 pt-1 pb-3">
            <p className="truncate font-semibold text-text">{name}</p>
            {email && <p className="truncate text-sm text-muted">{email}</p>}
          </div>
          <nav aria-label="Conta" className="flex flex-col gap-0.5 pt-2">
            <Link href="/conta" className={item} onClick={() => setOpen(false)}>
              <IconUser className="size-5 text-muted" />
              Minha conta
            </Link>
            <Link
              href="/conta#preferencias"
              className={item}
              onClick={() => setOpen(false)}
            >
              <IconGear className="size-5 text-muted" />
              Preferências
            </Link>
            <form action={signOut} className="mt-1 border-t border-border pt-1">
              <button type="submit" className={item}>
                <IconLogout className="size-5 text-muted" />
                Sair da conta
              </button>
            </form>
          </nav>
        </div>
      )}
    </div>
  );
}
