import Link from "next/link";
import { FinaleMark } from "./FinaleMark";

type LogoProps = {
  href?: string;
  compact?: boolean; // só o ícone (ex.: barra do app no celular)
};

// Versão horizontal: castelo + "FINALE". O nome completo fica no texto acessível.
export function Logo({ href = "/", compact = false }: LogoProps) {
  return (
    <Link
      href={href}
      className="flex min-h-touch items-center gap-2.5"
      aria-label="Academia Finale de Xadrez, início"
    >
      <FinaleMark className="h-8 w-auto shrink-0" />
      {!compact && (
        <span className="font-display text-[1.375rem] leading-none font-semibold tracking-[0.1em]">
          FINALE
        </span>
      )}
    </Link>
  );
}
