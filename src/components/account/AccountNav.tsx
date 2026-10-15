"use client";

import { useEffect, useState } from "react";

export const ACCOUNT_SECTIONS = [
  { id: "perfil", label: "Perfil" },
  { id: "assinatura", label: "Assinatura" },
  { id: "seguranca", label: "Segurança" },
  { id: "preferencias", label: "Preferências" },
  { id: "contas-vinculadas", label: "Contas vinculadas" },
  { id: "privacidade", label: "Privacidade" },
] as const;

// Menu da página Minha conta: lateral no desktop (marca a seção visível) e
// uma faixa de atalhos no celular. As seções ficam todas na mesma página.
export function AccountNav() {
  const [active, setActive] = useState<string>("perfil");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    for (const section of ACCOUNT_SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Seções da conta"
      className="-mx-4 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:self-start lg:overflow-visible lg:px-0"
    >
      <ul className="flex gap-1 whitespace-nowrap lg:flex-col lg:whitespace-normal">
        {ACCOUNT_SECTIONS.map((section) => {
          const current = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={current ? "location" : undefined}
                className={`flex min-h-touch items-center rounded-control px-3 text-[0.9375rem] transition ${
                  current
                    ? "bg-surface-2 font-semibold text-text"
                    : "text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
