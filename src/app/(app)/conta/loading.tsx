// Esqueleto de Minha conta enquanto os dados carregam.
function Block({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-card bg-surface-2 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function ContaLoading() {
  return (
    <div
      role="status"
      aria-label="Carregando sua conta"
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <Block className="h-4 w-20" />
        <Block className="h-10 w-56" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <div className="hidden flex-col gap-2 lg:flex">
          {Array.from({ length: 6 }, (_, i) => (
            <Block key={i} className="h-10" />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          <Block className="h-8 w-32" />
          <div className="flex items-center gap-5 rounded-card border border-border bg-surface p-6">
            <Block className="size-20 !rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Block className="h-5 w-48" />
              <Block className="h-4 w-64 max-w-full" />
              <Block className="h-4 w-32" />
            </div>
          </div>
          <Block className="h-48" />
          <Block className="h-72" />
        </div>
      </div>
    </div>
  );
}
