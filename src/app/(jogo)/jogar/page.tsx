import type { Metadata } from "next";
import { BotTrail } from "@/components/bot/BotTrail";
import { SectionLabel } from "@/components/ui/Label";
import { BRAND } from "@/content/brand";
import { getBotPlayer } from "@/lib/data/bot-progress";

const DESCRIPTION =
  "Jogue xadrez contra 10 personagens, do Peãozinho Curioso ao Rei Final. Grátis, no celular ou no computador.";

export const metadata: Metadata = {
  title: "Jogar contra o computador",
  description: DESCRIPTION,
  alternates: { canonical: "/jogar" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: BRAND.fullName,
    title: `Jogar contra o computador · ${BRAND.fullName}`,
    description: DESCRIPTION,
    url: "/jogar",
    images: "/opengraph-image",
  },
};

export default async function JogarPage() {
  const { loggedIn, progress } = await getBotPlayer();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <SectionLabel>Jogar</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Jogar contra o computador
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Dez adversários, cada um com seu jeito de jogar. Vença um para liberar o
          próximo e tente conquistar as três estrelas de cada nível.
        </p>
      </div>
      <BotTrail loggedIn={loggedIn} serverProgress={progress} />
    </div>
  );
}
