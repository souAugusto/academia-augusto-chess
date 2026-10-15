import { AppBottomNav, AppTopNav } from "@/components/app/AppNav";
import { HeaderAvatar } from "@/components/app/HeaderAvatar";
import { TrialBanner } from "@/components/app/TrialBanner";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Casca do app: cabeçalho com as áreas no desktop e barra inferior no celular.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-glass backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Logo href="/painel" />
          <AppTopNav />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <HeaderAvatar />
          </div>
        </div>
      </header>
      {/* Espaço extra embaixo no celular para a barra inferior não cobrir o conteúdo. */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-8 pb-28 sm:px-6 md:pb-16">
        <TrialBanner />
        {children}
      </main>
      <AppBottomNav />
    </>
  );
}
