import { AppShell } from "@/components/app/AppShell";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { createClient } from "@/lib/supabase/server";

// "Jogar contra o computador" é aberto a todos: quem tem conta vê a casca do
// app; o visitante vê o cabeçalho do site.
export default async function JogoLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims.sub) return <AppShell>{children}</AppShell>;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-8 pb-16 sm:px-6">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
