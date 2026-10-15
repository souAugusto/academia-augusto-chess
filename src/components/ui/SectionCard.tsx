import type { ReactNode } from "react";

// Bloco padrão das páginas de conta: título, descrição curta e conteúdo.
export function SectionCard({
  id,
  title,
  description,
  children,
  tone = "default",
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className={`flex flex-col gap-5 rounded-card border bg-surface p-5 shadow-card sm:p-6 ${
        tone === "danger" ? "border-danger/40" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-1">
        <h3 id={`${id}-titulo`} className="text-lg font-semibold">
          {title}
        </h3>
        {description && (
          <p className="text-[0.9375rem] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
