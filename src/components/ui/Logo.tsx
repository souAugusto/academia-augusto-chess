import Link from "next/link";
import { KnightIcon } from "./KnightIcon";

type LogoProps = {
  href?: string;
  size?: "md" | "sm";
};

export function Logo({ href = "/", size = "md" }: LogoProps) {
  const box = size === "md" ? "size-11" : "size-10";
  return (
    <Link href={href} className="flex min-h-toque items-center gap-3">
      <span
        className={`${box} flex items-center justify-center rounded-campo bg-dourado text-sobre-dourado`}
      >
        <KnightIcon className="size-8" detailColor="var(--color-dourado)" />
      </span>
      <span
        className={`font-titulo font-bold tracking-[0.01em] ${size === "md" ? "text-lg leading-tight sm:text-xl" : "text-lg leading-tight"}`}
      >
        Academia Augusto Chess
      </span>
    </Link>
  );
}
