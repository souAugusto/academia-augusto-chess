import type { Metadata } from "next";
import Link from "next/link";
import { BotGameList } from "@/components/bot/BotGameList";
import { SectionLabel } from "@/components/ui/Label";
import { MAX_ACCOUNT_GAMES, MAX_LOCAL_GAMES } from "@/lib/bot/history";
import { getBotGames } from "@/lib/data/bot-progress";

export const metadata: Metadata = {
  title: "Minhas partidas · Jogar",
  robots: { index: false },
};

export default async function MinhasPartidasPage() {
  const games = await getBotGames(MAX_ACCOUNT_GAMES);
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SectionLabel>
          <Link href="/jogar" className="hover:underline">
            Jogar
          </Link>
        </SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">Minhas partidas</h1>
        <p className="text-muted">
          {games === null
            ? `Sem conta, as últimas ${MAX_LOCAL_GAMES} partidas ficam só neste aparelho.`
            : `As últimas ${MAX_ACCOUNT_GAMES} partidas contra o computador ficam guardadas na sua conta.`}
        </p>
      </div>
      <BotGameList games={games} />
    </div>
  );
}
