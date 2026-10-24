"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/components/settings/SiteSettingsProvider";
import { visibleSections } from "@/lib/site-settings";
import { APP_SECTIONS, MOBILE_SECTIONS } from "./modules";

// Selo para o admin: a área está desligada para os alunos.
function HiddenBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="Oculta para usuários"
      className={
        compact
          ? "absolute top-1.5 right-[calc(50%-1.1rem)] size-2 rounded-full bg-danger"
          : "ml-1.5 rounded-full border border-border-strong px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted"
      }
    >
      {compact ? (
        <span className="sr-only">Oculta para usuários</span>
      ) : (
        "oculta para usuários"
      )}
    </span>
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Navegação do app no desktop (dentro do cabeçalho).
export function AppTopNav() {
  const pathname = usePathname();
  const { settings, isAdmin } = useSiteSettings();
  return (
    <nav
      aria-label="Áreas de treino"
      className="hidden items-center gap-1 md:flex"
    >
      {visibleSections(APP_SECTIONS, settings, isAdmin).map(
        ({ href, label, hiddenForUsers }) => {
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
              {hiddenForUsers && <HiddenBadge />}
            </Link>
          );
        },
      )}
    </nav>
  );
}

// Barra inferior no celular. Fica acima da área segura do iPhone.
export function AppBottomNav() {
  const pathname = usePathname();
  const { settings, isAdmin } = useSiteSettings();
  const sections = visibleSections(MOBILE_SECTIONS, settings, isAdmin);
  return (
    <nav
      aria-label="Áreas de treino"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-glass pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul
        className="mx-auto grid h-bottom-nav max-w-lg"
        style={{
          gridTemplateColumns: `repeat(${sections.length}, minmax(0, 1fr))`,
        }}
      >
        {sections.map(({ href, label, Icon, hiddenForUsers }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-full flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition ${
                  active ? "text-accent-text" : "text-muted hover:text-text"
                }`}
              >
                <Icon className="size-6" />
                {label}
                {hiddenForUsers && <HiddenBadge compact />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
