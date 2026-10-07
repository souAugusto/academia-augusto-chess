import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Créditos e licenças" };

// Avisos de licença de terceiros. Cada fase acrescenta o que passar a usar
// (puzzles do Lichess, aberturas, Stockfish).
const SECTIONS = [
  {
    title: "Peças do tabuleiro e ícone",
    paragraphs: [
      "As peças do tabuleiro e o cavalo do ícone da Finale vêm do conjunto criado por Colin M. L. Burnett (Wikimedia Commons), usado sob a licença BSD. Copyright (c) Colin M. L. Burnett.",
    ],
  },
  {
    title: "Bibliotecas",
    paragraphs: [
      "chess.js (licença BSD de 2 cláusulas), Next.js e React (MIT), Supabase (MIT e Apache 2.0), Tailwind CSS (MIT).",
    ],
  },
];

export default function CreditosPage() {
  return (
    <LegalPage
      eyebrow="Créditos"
      title="Créditos e licenças"
      updated="A Finale usa conteúdo e software abertos. Estes são os autores e as licenças."
      sections={SECTIONS}
    />
  );
}
