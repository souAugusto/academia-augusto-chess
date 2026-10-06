"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
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

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex size-toque items-center justify-center rounded-campo border border-borda-forte"
      >
        <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        <svg
          viewBox="0 0 24 24"
          className="size-6"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      {open && (
        <nav
          id={panelId}
          aria-label="Menu principal"
          className="absolute inset-x-0 top-full z-20 border-b border-borda bg-fundo-profundo px-4 pb-6"
        >
          <ul className="flex flex-col">
            {[...SITE_NAV_LINKS, { href: "/entrar", label: "Entrar" }].map(
              (link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-toque items-center border-b border-borda py-3 text-base font-semibold text-texto-secundario hover:text-texto"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
