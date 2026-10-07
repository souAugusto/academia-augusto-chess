import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import type { AppSectionId } from "./modules";
import { SectionIcon } from "./SectionIcon";

type ComingSoonProps = {
  section: AppSectionId;
  title: string;
  description: string;
  phase: string; // placeholder: bloqueia produção até o módulo existir
};

// Página provisória de um módulo que ainda será construído.
export function ComingSoon({
  section,
  title,
  description,
  phase,
}: ComingSoonProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Finale</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <Card className="flex flex-col items-start gap-4 p-8">
        <span className="flex size-12 items-center justify-center rounded-control bg-surface-2 text-accent-text">
          <SectionIcon id={section} className="size-6" />
        </span>
        <p className="max-w-xl leading-relaxed text-muted">{description}</p>
        <p className="text-sm text-muted">{phase}</p>
      </Card>
    </>
  );
}
