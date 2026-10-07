import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/ui/Logo";

// Área do aluno. Os demais itens (Puzzles, Aulas, Treino, Comunidade) entram
// no menu junto com as fases que criam essas páginas.
const APP_LINKS = [
  { href: "/painel", label: "Painel" },
  { href: "/conta", label: "Minha conta" },
];

export default function AlunoLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="border-b border-borda">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Logo href="/painel" size="sm" />
          <nav
            aria-label="Área do aluno"
            className="flex flex-wrap items-center gap-x-6 text-[0.9375rem] font-semibold"
          >
            {APP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-toque items-center text-texto-secundario hover:text-texto"
              >
                {link.label}
              </Link>
            ))}
            <form action={signOut}>
              <button
                type="submit"
                className="flex min-h-toque items-center text-texto-secundario hover:text-texto"
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 pt-9 pb-16 sm:px-6">
        {children}
      </main>
    </>
  );
}
