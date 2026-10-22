import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { requireAdmin } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false },
};

// Painel do Augusto. Quem não é admin recebe 404 (e cada action confere de novo).
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <>
      <header className="safe-top sticky top-0 z-30 border-b border-border bg-glass backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 pt-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo href="/admin" />
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Link
                href="/painel"
                className="rounded-control px-3 py-2 text-sm text-muted hover:text-text"
              >
                Voltar ao app
              </Link>
            </div>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        {children}
      </main>
    </>
  );
}
