import type { CSSProperties } from "react";

// Entrada suave (sobe 8px e aparece) em CSS puro: sem biblioteca de animação
// no painel. `index` escalona itens de uma lista. Com "reduzir movimento", não
// anima (globals.css).
export function Reveal({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal-in ${className ?? ""}`}
      style={{ animationDelay: `${index * 50}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

// Barra de progresso que cresce até o valor.
export function ProgressFill({ percent }: { percent: number }) {
  return (
    <div
      className="progress-fill h-full rounded-full bg-accent"
      style={{ width: `${percent}%` }}
    />
  );
}
