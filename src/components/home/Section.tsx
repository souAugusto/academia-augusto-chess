import { SectionLabel } from "@/components/ui/Label";

type SectionProps = {
  id?: string;
  width?: "base" | "narrow";
  className?: string;
  children: React.ReactNode;
};

export function Section({
  id,
  width = "base",
  className = "",
  children,
}: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div
        className={`mx-auto flex flex-col gap-10 px-4 sm:px-6 ${width === "base" ? "max-w-6xl" : "max-w-3xl"}`}
      >
        {children}
      </div>
    </section>
  );
}

type SectionHeadingProps = {
  label?: string;
  title: string;
  text?: string;
  center?: boolean;
};

export function SectionHeading({
  label,
  title,
  text,
  center = false,
}: SectionHeadingProps) {
  return (
    <div
      className={`flex max-w-2xl flex-col gap-3 ${center ? "mx-auto items-center text-center" : ""}`}
    >
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2 className="font-display text-section font-semibold tracking-tight">
        {title}
      </h2>
      {text && <p className="text-lg leading-relaxed text-muted">{text}</p>}
    </div>
  );
}
