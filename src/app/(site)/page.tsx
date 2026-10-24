import type { Metadata } from "next";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import Link from "next/link";
import { SectionIcon } from "@/components/app/SectionIcon";
import { Hero } from "@/components/home/Hero";
import {
  AnalysisSection,
  EquationSection,
  ImportSection,
  LessonsSection,
  ProblemSection,
  StyleSection,
} from "@/components/home/LandingSections";
import { Section, SectionHeading } from "@/components/home/Section";
import { PlanCards } from "@/components/plans/PlanCards";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import {
  FAQ,
  FINAL_CTA,
  HOW_IT_WORKS,
  MODULES,
  PLANS_SECTION,
} from "@/content/home";
import { contentCounts } from "@/content/licoes";
import { BRAND } from "@/content/brand";
import { ANALYSIS_IS_FREE } from "@/lib/analysis/config";
import {
  getDailyPuzzle,
  getIntensivoSeatsLeft,
  getPlans,
} from "@/lib/data/public";
import { homeJsonLd, serializeJsonLd } from "@/lib/seo/jsonld";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.academiafinale.site";

const DESCRIPTION =
  "Treino de xadrez com método: lições de aberturas e finais, táticas, análise das suas partidas com motor e um plano sob medida para o seu estilo.";

export const metadata: Metadata = {
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.fullName,
    title: BRAND.fullName,
    description: DESCRIPTION,
    url: "/",
    // O openGraph da página substitui o da raiz: repete a imagem padrão.
    images: "/opengraph-image",
  },
};

// Dados públicos: recalcula a cada minuto (vagas e puzzle do dia).
export const revalidate = 60;

export default async function HomePage() {
  const [plans, seatsLeft, puzzle] = await Promise.all([
    getPlans(),
    getIntensivoSeatsLeft(),
    getDailyPuzzle(),
  ]);

  return (
    <>
      {/* Convite para instalar o app (só celular, só nas páginas de entrada). */}
      <InstallPrompt />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            homeJsonLd({
              siteUrl: SITE,
              name: BRAND.fullName,
              description: DESCRIPTION,
              faq: FAQ.items,
            }),
          ),
        }}
      />
      <Hero puzzle={puzzle} />

      <ProblemSection />

      <Section id="modulos" className="py-20">
        <SectionHeading label={MODULES.label} title={MODULES.title} />
        <ul className="grid gap-5 sm:grid-cols-2">
          {MODULES.items.map((item) => {
            return (
              <Card as="li" key={item.id} className="flex flex-col gap-3 p-7">
                <span className="flex size-11 items-center justify-center rounded-control bg-surface-2 text-accent-text">
                  <SectionIcon id={item.id} className="size-6" />
                </span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="leading-relaxed text-muted">{item.text}</p>
              </Card>
            );
          })}
        </ul>
      </Section>

      <StyleSection />
      <ImportSection />
      <AnalysisSection free={ANALYSIS_IS_FREE} />
      <EquationSection />
      <LessonsSection counts={contentCounts()} />

      <Section id="como-funciona" className="pb-20">
        <SectionHeading label={HOW_IT_WORKS.label} title={HOW_IT_WORKS.title} />
        <ol className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 border-t border-border-strong pt-5"
            >
              <span className="font-display text-3xl text-accent-text">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="planos"
        className="border-y border-border bg-surface/40 py-20"
      >
        <SectionHeading
          label={PLANS_SECTION.label}
          title={PLANS_SECTION.title}
          center
        />
        <PlanCards plans={plans} seatsLeft={seatsLeft} />
      </Section>

      <Section id="faq" width="narrow" className="py-20">
        <h2 className="font-display text-section font-semibold tracking-tight">
          {FAQ.title}
        </h2>
        <div className="flex flex-col">
          {FAQ.items.map((item) => (
            <details
              key={item.question}
              className="group border-t border-border py-5 last:border-b [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex min-h-touch cursor-pointer items-center justify-between gap-4 text-lg font-semibold">
                {item.question}
                <span
                  aria-hidden="true"
                  className="text-2xl leading-none text-muted transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pt-2 leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <div className="bg-aurora flex flex-col items-center gap-5 rounded-panel border border-border bg-surface px-6 py-16 text-center shadow-card">
          <h2 className="max-w-2xl font-display text-section font-semibold tracking-tight">
            {FINAL_CTA.title}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-muted">
            {FINAL_CTA.text}
          </p>
          <Link
            href="#planos"
            className={buttonClasses("primary", "lg", "px-8")}
          >
            {FINAL_CTA.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
