import type { Metadata } from "next";
import { Section, SectionHeading } from "@/components/home/Section";
import { AppInstallPanel, InstallGuide } from "@/components/pwa/AppInstallPanel";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { APP_BENEFITS, APP_FAQ, APP_PAGE } from "@/content/app-page";
import { BRAND } from "@/content/brand";

const TITLE = "Baixar o app";
const DESCRIPTION =
  "Instale o app da Academia Finale de Xadrez no Android ou no iPhone em poucos segundos, sem loja de aplicativos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/app" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.fullName,
    title: `${TITLE} · ${BRAND.fullName}`,
    description: DESCRIPTION,
    url: "/app",
  },
};

export default function AppPage() {
  return (
    <>
      <section className="bg-aurora">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center sm:flex-row sm:px-6 sm:py-24 sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element -- ícone estático */}
          <img
            src="/icons/icon-512.png"
            alt={`Ícone do app ${BRAND.shortName}`}
            width={160}
            height={160}
            className="size-28 shrink-0 rounded-[2rem] shadow-card sm:size-40"
          />
          <div className="flex max-w-2xl flex-col items-center gap-5 sm:items-start">
            <SectionLabel>{APP_PAGE.label}</SectionLabel>
            <h1 className="font-display text-section font-semibold tracking-tight">
              {APP_PAGE.title}
            </h1>
            <p className="text-lg leading-relaxed text-muted">{APP_PAGE.text}</p>
            <AppInstallPanel />
          </div>
        </div>
      </section>

      <Section id="como-instalar" width="narrow" className="py-16">
        <SectionHeading label="Passo a passo" title="Como instalar" />
        <InstallGuide />
      </Section>

      <Section className="py-16">
        <SectionHeading title="Por que instalar" />
        <ul className="grid gap-4 sm:grid-cols-2">
          {APP_BENEFITS.map((benefit) => (
            <Card as="li" key={benefit.title} className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-semibold">{benefit.title}</h3>
              <p className="leading-relaxed text-muted">{benefit.text}</p>
            </Card>
          ))}
        </ul>
      </Section>

      <Section width="narrow" className="py-16">
        <h2 className="font-display text-section font-semibold tracking-tight">
          Dúvidas sobre o app
        </h2>
        <div className="flex flex-col">
          {APP_FAQ.map((item) => (
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
    </>
  );
}
