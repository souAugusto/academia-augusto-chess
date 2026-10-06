// Rótulo curto em caixa alta acima dos títulos de seção.
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[0.8125rem] font-bold tracking-rotulo text-dourado uppercase">
      {children}
    </span>
  );
}
