// Conteúdo inicial da Fase 3: finais clássicos (posições conferidas com o Stockfish)
// e um repertório de EXEMPLO para testar o treino de aberturas.
// Os comentários do repertório são rascunho: o Augusto substitui pelo conteúdo dele.
//
// Uso: npm run seed:phase3   (pode rodar de novo: atualiza pelo slug)
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
import { Chess } from "chess.js";
import { createClient } from "@supabase/supabase-js";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Falta ${name} no .env.local.`);
    process.exit(1);
  }
  return value;
}

const ENDGAMES = [
  {
    slug: "dama-contra-rei",
    title: "Dama contra rei",
    category: "Mates básicos",
    level: 1,
    fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1",
    user_color: "white",
    goal: "win",
    max_moves: 30,
    description:
      "Empurre o rei adversário para a borda com a dama, sem afogar, e traga o seu rei para ajudar no mate.",
  },
  {
    slug: "torre-contra-rei",
    title: "Torre contra rei",
    category: "Mates básicos",
    level: 1,
    fen: "8/8/8/4k3/8/8/8/R3K3 w - - 0 1",
    user_color: "white",
    goal: "win",
    max_moves: 50,
    description:
      "Com a torre, prenda o rei adversário em faixas cada vez menores. O seu rei precisa participar do mate.",
  },
  {
    slug: "rei-e-peao-na-sexta",
    title: "Rei e peão: rei na sexta",
    category: "Rei e peão",
    level: 1,
    fen: "4k3/8/3K4/3P4/8/8/8/8 w - - 0 1",
    user_color: "white",
    goal: "win",
    max_moves: 30,
    description:
      "Com o rei na sexta fileira à frente do peão, a vitória é certa. Use a oposição para levar o peão até a promoção.",
  },
  {
    slug: "rei-e-peao-defesa",
    title: "Rei e peão: defesa pela oposição",
    category: "Rei e peão",
    level: 1,
    fen: "8/8/3k4/8/3K4/3P4/8/8 w - - 0 1",
    user_color: "black",
    goal: "draw",
    max_moves: 30,
    description:
      "Você defende com as pretas. Mantenha a oposição diante do rei branco e volte para a frente do peão: assim o empate está garantido.",
  },
  {
    slug: "peao-de-torre",
    title: "Peão de torre",
    category: "Rei e peão",
    level: 2,
    fen: "7k/8/6KP/8/8/8/8/8 b - - 0 1",
    user_color: "black",
    goal: "draw",
    max_moves: 25,
    description:
      "Com o rei no canto, à frente do peão de torre, as pretas não podem ser vencidas. Cuidado para não sair do canto na hora errada.",
  },
  {
    slug: "lucena",
    title: "Posição de Lucena",
    category: "Finais de torre",
    level: 3,
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    user_color: "white",
    goal: "win",
    max_moves: 40,
    description:
      "O rei branco está preso na frente do peão. A técnica é cortar o rei adversário e montar uma ponte com a torre para se proteger dos xeques.",
  },
  {
    slug: "philidor",
    title: "Defesa de Philidor",
    category: "Finais de torre",
    level: 3,
    fen: "4k3/8/r7/3PK3/8/8/8/7R b - - 0 1",
    user_color: "black",
    goal: "draw",
    max_moves: 40,
    description:
      "Mantenha a torre na sexta fileira enquanto o peão não avança. Quando ele avançar, passe a dar xeques por trás.",
  },
];

// Repertório de exemplo: [lance em SAN, comentário, continuações].
type Line = [string, string | null, Line[]?];

const ITALIAN: Line[] = [
  [
    "e4",
    "Ocupa o centro e abre caminho para a dama e o bispo.",
    [
      [
        "e5",
        "As pretas respondem disputando o centro.",
        [
          [
            "Nf3",
            "Desenvolve com ataque ao peão de e5.",
            [
              [
                "Nc6",
                "Defende o peão e desenvolve.",
                [
                  [
                    "Bc4",
                    "O bispo mira f7, o ponto mais sensível das pretas.",
                    [
                      [
                        "Bc5",
                        "As pretas colocam o bispo na diagonal ativa.",
                        [
                          [
                            "c3",
                            "Prepara d4 para ganhar espaço no centro.",
                            [],
                          ],
                        ],
                      ],
                      [
                        "Nf6",
                        "Contra-ataque no peão de e4.",
                        [
                          [
                            "d3",
                            "Defende e4 com calma e mantém a estrutura sólida.",
                            [],
                          ],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
              [
                "d6",
                "Defesa passiva do peão de e5.",
                [["d4", "Com o centro livre, ocupe-o com dois peões.", []]],
              ],
            ],
          ],
        ],
      ],
      [
        "c5",
        "A Defesa Siciliana.",
        [["Nf3", "Desenvolvimento flexível, pronto para jogar d4.", []]],
      ],
      [
        "e6",
        "A Defesa Francesa.",
        [["d4", "Monte o centro clássico com dois peões.", []]],
      ],
    ],
  ],
];

async function main() {
  const supabase = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );

  const { error: endgameError } = await supabase.from("endgames").upsert(
    ENDGAMES.map((endgame, position) => ({
      ...endgame,
      position,
      is_published: true,
    })),
    { onConflict: "slug" },
  );
  if (endgameError) throw endgameError;
  console.log(`  ${ENDGAMES.length} finais cadastrados.`);

  const { data: repertoire, error: repertoireError } = await supabase
    .from("repertoires")
    .upsert(
      {
        slug: "italiana-exemplo",
        title: "Italiana com as brancas (exemplo)",
        description:
          "Repertório de exemplo para testar o treino. Os comentários são provisórios e serão trocados pelo conteúdo do Augusto.",
        color: "white",
        is_published: true,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (repertoireError || !repertoire)
    throw repertoireError ?? new Error("Repertório não gravado.");
  const repertoireId: string = repertoire.id;

  // Recria a árvore do zero (os nós antigos saem em cascata).
  await supabase
    .from("repertoire_nodes")
    .delete()
    .eq("repertoire_id", repertoireId);
  let count = 0;
  async function insert(lines: Line[], parentId: string | null, fen: string) {
    for (const [index, [san, comment, next = []]] of lines.entries()) {
      const chess = new Chess(fen);
      const move = chess.move(san);
      const { data, error } = await supabase
        .from("repertoire_nodes")
        .insert({
          repertoire_id: repertoireId,
          parent_id: parentId,
          uci: `${move.from}${move.to}${move.promotion ?? ""}`,
          san: move.san,
          comment,
          position: index,
        })
        .select("id")
        .single();
      if (error) throw error;
      count += 1;
      await insert(next, data.id, chess.fen());
    }
  }
  await insert(ITALIAN, null, new Chess().fen());
  console.log(`  Repertório de exemplo com ${count} lances.`);
  console.log("Pronto.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
