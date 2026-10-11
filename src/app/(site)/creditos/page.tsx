import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Créditos e licenças" };

// Avisos de licença de terceiros. Cada fase acrescenta o que passar a usar.
const SECTIONS = [
  {
    title: "Peças do tabuleiro e ícone",
    paragraphs: [
      "As peças do tabuleiro e o cavalo do ícone da Finale vêm do conjunto criado por Colin M. L. Burnett (Wikimedia Commons), usado sob a licença BSD. Copyright (c) Colin M. L. Burnett.",
    ],
  },
  {
    title: "Motor de xadrez Stockfish",
    paragraphs: [
      "O treino de finais usa o Stockfish 19 (versão lite, compilada para WebAssembly por Nathan Rugg no projeto stockfish.js), distribuído sem modificações sob a GNU General Public License versão 3. O motor roda separado do site, no seu navegador, e se comunica só por mensagens no protocolo UCI.",
      "Licença completa: /engine/COPYING.txt. Código-fonte: github.com/nmrugg/stockfish.js (versão v19.0.1) e github.com/official-stockfish/Stockfish.",
    ],
  },
  {
    title: "Puzzles e aberturas",
    paragraphs: [
      "Os puzzles de táticas vêm do banco aberto do Lichess (database.lichess.org), em domínio público (CC0).",
      "Os nomes e códigos ECO das aberturas vêm do repositório lichess-org/chess-openings, em domínio público (CC0).",
    ],
  },
  {
    title: "Bibliotecas",
    paragraphs: [
      "chess.js (licença BSD de 2 cláusulas), react-chessboard (MIT), Next.js e React (MIT), Supabase (MIT e Apache 2.0), Tailwind CSS (MIT).",
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
