import type { Metadata } from "next";
import { BotGameReplay } from "@/components/bot/BotGameReplay";
import { getBotGame } from "@/lib/data/bot-progress";

export const metadata: Metadata = {
  title: "Partida · Jogar",
  robots: { index: false },
};

export default async function PartidaRoboPage({
  params,
}: PageProps<"/jogar/partidas/[id]">) {
  const { id } = await params;
  const game = await getBotGame(id);
  return (
    <div className="board-page">
      <BotGameReplay
        key={id}
        id={id}
        loggedIn={game !== "login"}
        game={game === "login" ? null : game}
      />
    </div>
  );
}
