import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { NextLiveCard } from "@/components/home/NextLiveCard";
import { Card, Section, SectionHeading } from "@/components/home/Section";
import { PlanCards } from "@/components/plans/PlanCards";
import { buttonClasses } from "@/components/ui/button";
import {
  BENEFITS,
  FAQ,
  FINAL_CTA,
  METHOD,
  PLANS_SECTION,
  STEPS,
} from "@/content/home";
import {
  getDailyPuzzle,
  getIntensivoSeatsLeft,
  getNextPublicLive,
  getPlans,
} from "@/lib/data/public";

// Dados públicos: recalcula a cada minuto (vagas, próxima live, puzzle do dia).
export const revalidate = 60;

export default async function HomePage() {
  const [plans, seatsLeft, live, puzzle] = await Promise.all([
    getPlans(),
    getIntensivoSeatsLeft(),
    getNextPublicLive(),
    getDailyPuzzle(),
  ]);

  return (
    <>
      <Hero puzzle={puzzle} />
      <NextLiveCard live={live} />

      <Section id="beneficios" band className="py-20">
        <SectionHeading eyebrow={BENEFITS.eyebrow} title={BENEFITS.title} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.items.map((item, index) => (
            <Card key={item.title}>
              <span className="font-titulo text-[1.75rem] text-dourado">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-texto-secundario">
                {item.text}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="py-20">
        <SectionHeading title={STEPS.title} />
        <ol className="flex flex-wrap gap-8">
          {STEPS.items.map((step) => (
            <li
              key={step.title}
              className="flex min-w-0 flex-[1_1_280px] flex-col gap-2.5 border-t-2 border-dourado pt-5"
            >
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-texto-secundario">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="metodo" className="pb-20">
        <SectionHeading
          eyebrow={METHOD.eyebrow}
          title={METHOD.title}
          text={METHOD.text}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD.phases.map((phase, index) => (
            <Card key={phase.title}>
              <span className="font-titulo text-[1.75rem] text-dourado">
                Fase {index + 1}
              </span>
              <h3 className="text-xl font-bold">{phase.title}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-texto-secundario">
                {phase.text}
              </p>
            </Card>
          ))}
        </div>
        <span className="text-[0.8125rem] text-texto-discreto">
          {METHOD.pending}
        </span>
      </Section>

      <Section id="planos" band width="planos" className="py-20">
        <SectionHeading
          eyebrow={PLANS_SECTION.eyebrow}
          title={PLANS_SECTION.title}
          center
        />
        <PlanCards plans={plans} seatsLeft={seatsLeft} />
      </Section>

      <Section id="faq" width="estreita" className="gap-8 py-20">
        <h2 className="font-titulo text-secao font-bold">{FAQ.title}</h2>
        <div className="flex flex-col">
          {FAQ.items.map((item) => (
            <div
              key={item.question}
              className="flex flex-col gap-2 border-t border-borda py-[1.375rem] last:border-b"
            >
              <h3 className="text-lg font-bold">{item.question}</h3>
              <p className="text-[0.9375rem] leading-relaxed text-texto-secundario">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-faixa bg-superficie-alta px-6 py-14 text-center sm:px-8">
          <h2 className="max-w-[640px] font-titulo text-secao font-bold">
            {FINAL_CTA.title}
          </h2>
          <p className="max-w-[520px] text-[1.0625rem] leading-relaxed text-texto-secundario">
            {FINAL_CTA.text}
          </p>
          <Link
            href="#planos"
            className={buttonClasses("primario", "lg", "px-8")}
          >
            {FINAL_CTA.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
