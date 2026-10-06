import { Eyebrow } from "@/components/ui/Eyebrow";

// Contêiner e cabeçalho de seção da Home.
type SectionProps = {
  id?: string;
  band?: boolean; // faixa com fundo profundo e bordas
  width?: "base" | "estreita" | "planos";
  className?: string;
  children: React.ReactNode;
};

const WIDTHS = {
  base: "max-w-[1200px]",
  estreita: "max-w-[800px]",
  planos: "max-w-[1000px]",
};

export function Section({
  id,
  band = false,
  width = "base",
  className = "",
  children,
}: SectionProps) {
  const inner = (
    <div
      className={`mx-auto flex flex-col gap-10 px-4 sm:px-6 ${WIDTHS[width]} ${className}`}
    >
      {children}
    </div>
  );
  return band ? (
    <section
      id={id}
      className="scroll-mt-4 border-y border-borda bg-fundo-profundo"
    >
      {inner}
    </section>
  ) : (
    <section id={id} className="scroll-mt-4">
      {inner}
    </section>
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  center?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  text,
  center = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`flex max-w-[680px] flex-col gap-3 ${center ? "mx-auto items-center text-center" : ""}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-titulo text-secao font-bold">{title}</h2>
      {text && (
        <p className="text-[1.0625rem] leading-relaxed text-texto-secundario">
          {text}
        </p>
      )}
    </div>
  );
}

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5 rounded-card border border-borda bg-superficie p-7 transition-colors hover:border-borda-forte">
      {children}
    </div>
  );
}
