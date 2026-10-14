"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/alunos", label: "Alunos" },
  { href: "/admin/planos", label: "Planos e vagas" },
  { href: "/admin/aulas", label: "Aulas" },
  { href: "/admin/aberturas", label: "Aberturas" },
  { href: "/admin/finais", label: "Finais" },
  { href: "/admin/conjuntos", label: "Conjuntos" },
  { href: "/admin/trilhas", label: "Trilhas" },
  { href: "/admin/titulos", label: "Títulos" },
  { href: "/admin/puzzle-do-dia", label: "Puzzle do dia" },
  { href: "/admin/configuracoes", label: "Lives e grupos" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Painel admin" className="-mx-4 overflow-x-auto px-4">
      <ul className="flex gap-1 whitespace-nowrap">
        {LINKS.map(({ href, label }) => {
          const active =
            href === "/admin"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-touch items-center rounded-control px-3 text-[0.9375rem] transition ${
                  active
                    ? "bg-surface-2 font-semibold text-text"
                    : "text-muted hover:text-text"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
