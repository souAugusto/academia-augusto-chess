import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { LEGAL_UPDATED, PRIVACY } from "@/content/legal";

export const metadata: Metadata = {
  title: "Política de privacidade",
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de privacidade"
      updated={LEGAL_UPDATED}
      sections={PRIVACY}
    />
  );
}
