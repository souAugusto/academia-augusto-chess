import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { CLASSIFY_CONFIG } from "@/lib/analysis/classify";
import { ANALYSIS_PROFILE } from "@/lib/analysis/profile";

export const metadata: Metadata = {
  title: "Como analisamos as partidas",
  description:
    "Como funciona a análise de partidas da Academia Finale: motor, profundidade, classes dos lances e precisão.",
};

// Todos os números vêm de ANALYSIS_PROFILE e CLASSIFY_CONFIG: a página nunca
// diz algo diferente do que o motor faz.
const p = ANALYSIS_PROFILE;
const c = CLASSIFY_CONFIG;

const SECTIONS = [
  {
    title: "O motor",
    paragraphs: [
      `A análise usa o ${p.engineName} (${p.engineBuild}), que roda no seu próprio aparelho. Nada da partida é enviado a outro serviço para ser calculado.`,
      "Todos os alunos recebem o mesmo padrão de análise. Não existe ajuste de profundidade ou de força: a mesma partida dá sempre a mesma análise.",
    ],
  },
  {
    title: "Análise em duas passagens",
    paragraphs: [
      `Primeira passagem: cada posição da partida é analisada em profundidade ${p.depth}, com a melhor linha do motor.`,
      `Segunda passagem: os lances mais decisivos (até ${p.maxDeepPositions} por partida, como possíveis sacrifícios, viradas e posições forçadas) recebem uma nova análise em profundidade ${p.deepDepth} com ${p.deepLines} linhas candidatas. É ela que permite reconhecer lances brilhantes e ótimos.`,
      "Você já pode navegar pelos lances analisados enquanto o resto continua. A análise concluída fica guardada na sua conta e abre na hora da próxima vez.",
    ],
  },
  {
    title: "Chance de vitória e perda de cada lance",
    paragraphs: [
      "A avaliação do motor é convertida em chance de vitória, de 0 a 100, sempre do ponto de vista de quem jogou o lance (fórmula aberta do Lichess).",
      "A perda de um lance é quanto essa chance caiu em relação ao melhor lance do motor. Se o lance jogado foi o melhor, a perda é zero.",
    ],
  },
  {
    title: "As classes dos lances",
    paragraphs: [
      "Brilhante: um bom sacrifício de peça, que é o melhor lance ou quase, deixa a posição boa e não acontece numa posição já ganha. São raros: no máximo 2 por jogador numa partida.",
      `Ótimo: o melhor lance quando ele é o único que mantém a posição (a segunda opção perde ${c.great.onlyMoveGap} pontos ou mais) ou quando muda o rumo da partida.`,
      "Melhor: o lance que o motor escolheria.",
      `Excelente: perda de até ${c.excellent} pontos. Bom: até ${c.good}.`,
      "Teoria: lance de uma abertura conhecida (repositório aberto lichess-org/chess-openings).",
      `Imprecisão: perda de até ${c.inaccuracy} pontos. Erro: até ${c.mistake}. Erro grave: mais de ${c.mistake}, ou permitir um mate que não existia.`,
      "Chance perdida: o adversário tinha acabado de errar, você estava ganhando e o lance deixou a vantagem escapar (ou deixou escapar um mate).",
    ],
  },
  {
    title: "Precisão",
    paragraphs: [
      "Cada lance recebe uma precisão de 0 a 100 a partir da perda (fórmula aberta do Lichess). A precisão da partida combina a média dessas precisões, com mais peso para os momentos de maior tensão, e a média harmônica, que pesa mais os erros grandes.",
      "Não damos uma nota de rating para a partida: seria um número sem base sólida.",
    ],
  },
  {
    title: "Limites",
    paragraphs: [
      "A análise é de um motor de xadrez e pode divergir da de outros motores ou sites. As classes, em especial Brilhante e Ótimo, são estimativas com regras próprias da Finale, não verdades absolutas.",
      "O resultado é só seu: não conta para o rating de táticas, títulos ou ranking.",
    ],
  },
];

export default function ComoAnalisamosPage() {
  return (
    <LegalPage
      eyebrow="Análise de partidas"
      title="Como analisamos"
      updated={`Padrão atual: ${p.engineName}, profundidade ${p.depth}, ${p.deepLines} linhas nos lances decisivos.`}
      sections={SECTIONS}
    />
  );
}
