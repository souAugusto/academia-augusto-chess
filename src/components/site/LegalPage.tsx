import { SectionLabel } from "@/components/ui/Label";

export type LegalSection = { title: string; paragraphs: string[] };

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  sections: LegalSection[];
};

export function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: LegalPageProps) {
  return (
    <article className="mx-auto flex max-w-[800px] flex-col gap-10 px-4 py-16 sm:px-6">
      <header className="flex flex-col gap-3">
        <SectionLabel>{eyebrow}</SectionLabel>
        <h1 className="font-display text-section font-bold">{title}</h1>
        <p className="text-sm text-muted">{updated}</p>
      </header>
      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
