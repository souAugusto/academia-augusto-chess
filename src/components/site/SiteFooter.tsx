import Link from "next/link";
import { FinaleMark } from "@/components/brand/FinaleMark";
import { BRAND } from "@/content/brand";

const LINKS = [
  { href: "/app", label: "Baixar app" },
  { href: "/planos", label: "Planos" },
  { href: "/termos", label: "Termos de uso" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/creditos", label: "Créditos" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted sm:px-6">
        <div className="flex items-center gap-3">
          <FinaleMark className="size-7" />
          <span>© 2026 {BRAND.fullName}</span>
        </div>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-touch items-center hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
