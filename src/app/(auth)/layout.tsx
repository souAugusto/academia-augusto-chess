import { KnightIcon } from "@/components/ui/KnightIcon";
import { Logo } from "@/components/ui/Logo";

// Layout das telas de acesso (desenho docs/design/entrar.dc.html).
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-1 flex-wrap">
      <section className="flex min-w-0 flex-[1_1_420px] flex-col justify-between gap-12 border-borda bg-fundo-profundo p-6 sm:p-12 lg:border-r">
        <Logo href="/" />
        <div className="hidden max-w-[460px] flex-col gap-5 sm:flex">
          <KnightIcon
            className="size-28 text-dourado"
            detailColor="var(--color-fundo-profundo)"
          />
          <h1 className="font-titulo text-[clamp(2rem,3.6vw,3rem)] leading-[1.1] font-bold">
            Seu próximo lance começa aqui.
          </h1>
          <p className="text-[1.0625rem] leading-relaxed text-texto-secundario">
            Entre para continuar seus treinos, ou crie sua conta para escolher
            um plano e entrar na comunidade.
          </p>
        </div>
        <span className="hidden text-[0.8125rem] text-texto-discreto sm:block">
          © 2026 Academia Augusto Chess
        </span>
      </section>
      <main className="flex min-w-0 flex-[1_1_460px] items-center justify-center px-4 py-12 sm:px-6">
        <div className="flex w-full max-w-[440px] flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
