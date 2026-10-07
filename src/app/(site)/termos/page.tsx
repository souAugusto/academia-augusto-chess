import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { LEGAL_UPDATED, TERMS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Termos de uso",
};

export default function TermosPage() {
  return (
    <LegalPage
      eyebrow="Termos"
      title="Termos de uso"
      updated={LEGAL_UPDATED}
      sections={TERMS}
    />
  );
}
