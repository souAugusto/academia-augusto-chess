// Classes de botão do design system. Usadas em <Link>, <a> e <button>.
export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "outline-accent";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex min-h-touch items-center justify-center gap-2 rounded-control text-center font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-on-accent shadow-[0_8px_24px_-12px_var(--accent)] hover:brightness-110 active:brightness-95",
  secondary:
    "border border-border-strong bg-surface text-text hover:bg-surface-2",
  ghost: "text-muted hover:bg-surface-2 hover:text-text",
  "outline-accent":
    "border border-accent text-accent-text hover:bg-accent hover:text-on-accent",
};

const sizes: Record<ButtonSize, string> = {
  md: "px-4 py-2.5 text-[0.9375rem]",
  lg: "px-6 py-3.5 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}
