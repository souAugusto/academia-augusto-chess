import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { SITE_NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-glass backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Logo href="/" />
        <nav
          aria-label="Principal"
          className="hidden items-center gap-1 text-[0.9375rem] lg:flex"
        >
          {SITE_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-control px-3 py-2 text-muted transition hover:text-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle className="max-sm:hidden" />
          <Link
            href="/entrar"
            className={buttonClasses("ghost", "md", "max-sm:hidden")}
          >
            Entrar
          </Link>
          <Link href="/#planos" className={buttonClasses("primary")}>
            Assinar
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
