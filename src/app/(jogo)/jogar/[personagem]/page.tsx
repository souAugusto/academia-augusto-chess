import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BotGame } from "@/components/bot/BotGame";
import { botById } from "@/content/personagens";
import { getBotPlayer } from "@/lib/data/bot-progress";

export async function generateMetadata({
  params,
}: PageProps<"/jogar/[personagem]">): Promise<Metadata> {
  const bot = botById((await params).personagem);
  if (!bot) return {};
  return {
    title: `${bot.nome} · Jogar`,
    description: `Jogue xadrez contra ${bot.nome} (nível ${bot.nivel}). ${bot.descricao}`,
  };
}

export default async function JogarPersonagemPage({
  params,
}: PageProps<"/jogar/[personagem]">) {
  const bot = botById((await params).personagem);
  if (!bot) notFound();
  const { loggedIn, progress } = await getBotPlayer();
  return (
    <div className="board-page">
      <BotGame key={bot.id} botId={bot.id} loggedIn={loggedIn} serverProgress={progress} />
    </div>
  );
}
