import { unlinkAccount } from "@/app/(app)/partidas/actions";
import { Card } from "@/components/ui/Card";
import type { LinkedAccount } from "@/lib/data/games";
import { formatLongDate } from "@/lib/format";
import { PLATFORM_LABELS, type Platform } from "@/lib/games/normalize";
import { ImportButton } from "./ImportButton";
import { LinkAccountForm } from "./LinkAccountForm";

const PLATFORMS: Platform[] = ["chesscom", "lichess"];

// Chess.com e Lichess: vincular, atualizar partidas e desvincular.
// Usado em Minhas partidas e em Minha conta (mesma lógica de importação).
export function LinkedAccounts({ accounts }: { accounts: LinkedAccount[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PLATFORMS.map((platform) => {
        const account = accounts.find((item) => item.platform === platform);
        return (
          <Card key={platform} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-lg font-semibold">
                {PLATFORM_LABELS[platform]}
              </h4>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  account
                    ? "border-success text-success"
                    : "border-border text-muted"
                }`}
              >
                {account ? "Vinculada" : "Não vinculada"}
              </span>
            </div>
            {account ? (
              <>
                <div className="flex flex-col gap-1 text-sm">
                  <span>
                    Usuário:{" "}
                    <span className="font-semibold">{account.username}</span>
                  </span>
                  <span className="text-muted">
                    {account.games === 0
                      ? "Nenhuma partida importada ainda"
                      : `${account.games} partidas salvas`}
                    {account.lastImportAt &&
                      ` · última atualização em ${formatLongDate(account.lastImportAt)}`}
                  </span>
                </div>
                <ImportButton
                  platform={platform}
                  firstTime={!account.lastImportAt}
                />
                <form action={unlinkAccount}>
                  <input type="hidden" name="platform" value={platform} />
                  <button
                    type="submit"
                    className="min-h-touch text-sm text-muted underline-offset-4 hover:text-text hover:underline"
                  >
                    Desvincular (apaga as partidas importadas desta conta)
                  </button>
                </form>
              </>
            ) : (
              <LinkAccountForm platform={platform} />
            )}
          </Card>
        );
      })}
    </div>
  );
}
