import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Créditos e licenças" };

// Avisos de licença de terceiros. Cada fase acrescenta o que passar a usar.
const SECTIONS = [
  {
    title: "Peças do tabuleiro",
    paragraphs: [
      "Clássico (padrão): conjunto de Colin M. L. Burnett (Wikimedia Commons), usado sob a licença BSD. Copyright (c) Colin M. L. Burnett.",
      "Moderno: conjunto Chessnut, de Alexis Luengas (github.com/LexLuengas/chessnut-pieces), sob a Apache License 2.0. Copyright 2015 Alexis Luengas. Licença em /pieces/chessnut/LICENSE.txt.",
      "Fantasia e Minimalista: conjuntos Fantasy e Spatial, de Maurizio Monge (github.com/maurimo/chess-art), sob a licença MIT. Copyright (c) Maurizio Monge. Licença em /pieces/fantasy/LICENSE.txt.",
      "Todos os conjuntos são usados sem modificação.",
    ],
  },
  {
    title: "Sons",
    paragraphs: [
      "Os sons do tabuleiro (pacotes Suave e Madeira) são gerados por código no seu navegador, criados pela própria Finale. Não usam gravações de terceiros.",
    ],
  },
  {
    title: "Motor de xadrez Stockfish",
    paragraphs: [
      "A análise de partidas e o treino de finais usam o Stockfish 19, versão lite de uma linha de execução (arquivo stockfish-19-lite-single), compilada para WebAssembly no projeto stockfish.js de Nathan Rugg e publicada no pacote npm stockfish, versão 19.0.1. Os arquivos são distribuídos sem nenhuma modificação.",
      "O Stockfish é software livre, sob a GNU General Public License versão 3 (GPL-3.0). Você pode usá-lo, estudá-lo, copiá-lo e redistribuí-lo nos termos dessa licença. O motor roda separado do site, no seu navegador (num Web Worker), e se comunica com a Finale só por mensagens no protocolo UCI.",
      "Licença completa: /licencas/stockfish-GPL-3.0.txt (também em /engine/COPYING.txt). Código-fonte correspondente: github.com/nmrugg/stockfish.js/tree/v19.0.1 e github.com/official-stockfish/Stockfish. Autores do Stockfish: T. Romstad, M. Costalba, J. Kiiski, G. Linscott e colaboradores.",
    ],
  },
  {
    title: "Avaliações do Lichess",
    paragraphs: [
      "Nas primeiras jogadas, a análise de partidas consulta a nuvem de avaliações pública do Lichess (lichess.org), um serviço gratuito e de código aberto. Em partidas importadas do Lichess que já foram analisadas lá, reaproveitamos essas avaliações.",
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
      "Dados de compatibilidade de navegadores do caniuse-lite (CC-BY 4.0, por Alexis Deveria e colaboradores do Can I Use).",
      "Lista completa das bibliotecas, com versões e licenças: /licencas/THIRD_PARTY_LICENSES.txt.",
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
