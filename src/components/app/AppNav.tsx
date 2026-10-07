"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_SECTIONS } from "./modules";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Navegação do app no desktop (dentro do cabeçalho).
export function AppTopNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Áreas de treino"
      className="hidden items-center gap-1 md:flex"
    >
      {APP_SECTIONS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-control px-3 py-2 text-[0.9375rem] transition ${
              active
                ? "bg-surface-2 font-semibold text-text"
                : "text-muted hover:text-text"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Barra inferior no celular. Fica acima da área segura do iPhone.
export function AppBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Áreas de treino"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-glass pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid h-bottom-nav max-w-lg grid-cols-5">
        {APP_SECTIONS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition ${
                  active ? "text-accent-text" : "text-muted hover:text-text"
                }`}
              >
                <Icon className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
