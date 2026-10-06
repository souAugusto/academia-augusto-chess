// Classes dos botões dos desenhos. Usadas em <Link>, <a> e <button>.
export type ButtonVariant =
  "primario" | "contorno" | "contorno-dourado" | "claro";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex min-h-toque items-center justify-center rounded-botao text-center font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100";

const variants: Record<ButtonVariant, string> = {
  primario: "bg-dourado text-sobre-dourado",
  contorno: "border-[1.5px] border-borda-forte text-texto font-semibold",
  "contorno-dourado": "border-[1.5px] border-dourado text-dourado",
  claro: "bg-texto text-fundo",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-[0.9375rem]",
  lg: "px-7 py-4 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primario",
  size: ButtonSize = "md",
  extra = "",
): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}
