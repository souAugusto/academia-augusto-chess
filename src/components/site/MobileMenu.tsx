"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { IconClose, IconMenu } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SITE_NAV_LINKS } from "./nav-links";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass =
    "flex min-h-touch items-center border-b border-border py-3 text-base font-medium text-muted hover:text-text";

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-touch items-center justify-center rounded-control text-muted hover:bg-surface-2 hover:text-text"
      >
        <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        {open ? <IconClose /> : <IconMenu />}
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label="Menu principal"
          className="absolute inset-x-0 top-full border-b border-border bg-bg/95 px-4 pb-5 backdrop-blur-xl"
        >
          <ul className="flex flex-col">
            {[...SITE_NAV_LINKS, { href: "/entrar", label: "Entrar" }].map(
              (link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={linkClass}
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <div className="flex items-center justify-between pt-3 text-sm text-muted">
            Tema
            <ThemeToggle />
          </div>
        </nav>
      )}
    </div>
  );
}
