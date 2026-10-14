// Dados estruturados (schema.org) da página inicial.
export type FaqItem = { question: string; answer: string };

export function homeJsonLd(input: {
  siteUrl: string;
  name: string;
  description: string;
  faq: readonly FaqItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${input.siteUrl}/#organizacao`,
        name: input.name,
        url: input.siteUrl,
        description: input.description,
      },
      {
        "@type": "WebSite",
        "@id": `${input.siteUrl}/#site`,
        name: input.name,
        url: input.siteUrl,
        inLanguage: "pt-BR",
        publisher: { "@id": `${input.siteUrl}/#organizacao` },
      },
      {
        "@type": "FAQPage",
        mainEntity: input.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}

// JSON seguro para <script>: impede que "</script>" no texto feche a tag.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
