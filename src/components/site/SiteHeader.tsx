import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { MobileMenu } from "./MobileMenu";
import { SITE_NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="relative border-b border-borda">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-[1.125rem] sm:px-6">
        <Logo href="/" />
        <nav
          aria-label="Principal"
          className="hidden items-center gap-6 text-[0.9375rem] font-semibold lg:flex"
        >
          {SITE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-texto-secundario hover:text-texto"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/entrar"
            className="text-texto-secundario hover:text-texto"
          >
            Entrar
          </Link>
          <Link href="/#planos" className={buttonClasses("primario")}>
            Assinar
          </Link>
        </nav>
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/#planos"
            className={buttonClasses("primario", "md", "px-4")}
          >
            Assinar
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
