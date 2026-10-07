import { FinaleMark } from "@/components/brand/FinaleMark";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { BRAND } from "@/content/brand";

// Telas de acesso: painel da marca (desktop) e formulário.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <section className="bg-aurora flex flex-col justify-between gap-10 border-border bg-surface px-4 py-3 sm:px-8 lg:w-[44%] lg:border-r lg:p-12">
        <div className="flex items-center justify-between">
          <Logo href="/" />
          <ThemeToggle className="lg:hidden" />
        </div>
        <div className="hidden max-w-md flex-col gap-6 lg:flex">
          <FinaleMark className="size-20" />
          <h1 className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.08] font-semibold tracking-tight">
            Seu próximo lance começa aqui.
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            Entre para continuar seus treinos, ou crie sua conta para escolher
            um plano.
          </p>
        </div>
        <div className="hidden items-center justify-between text-sm text-muted lg:flex">
          <span>© 2026 {BRAND.fullName}</span>
          <ThemeToggle />
        </div>
      </section>
      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:px-6 lg:items-center">
        <div className="flex w-full max-w-[440px] flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
