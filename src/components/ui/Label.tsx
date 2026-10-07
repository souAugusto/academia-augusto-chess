// Rótulo curto em caixa alta acima de títulos.
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold tracking-label text-accent-text uppercase">
      {children}
    </span>
  );
}
