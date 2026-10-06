import Link from "next/link";
import { TIKTOK_URL } from "./nav-links";

export function SiteFooter() {
  const linkClass =
    "flex min-h-toque items-center text-texto-secundario hover:text-texto";
  return (
    <footer className="border-t border-borda">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-7 text-sm text-texto-discreto sm:px-6">
        <span>© 2026 Academia Augusto Chess</span>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-5">
          <Link href="/termos" className={linkClass}>
            Termos de uso
          </Link>
          <Link href="/privacidade" className={linkClass}>
            Privacidade
          </Link>
          <a
            href={TIKTOK_URL}
            className={linkClass}
            rel="noopener noreferrer"
            target="_blank"
          >
            TikTok
          </a>
        </nav>
      </div>
    </footer>
  );
}
