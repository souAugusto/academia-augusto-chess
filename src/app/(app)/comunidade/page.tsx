import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/account/Avatar";
import { PlanRequired } from "@/components/app/PlanRequired";
import { TitleBadge } from "@/components/titles/TitleBadge";
import { SectionLabel } from "@/components/ui/Label";
import { RATING_DISCLAIMER } from "@/content/titulos";
import { requireUser } from "@/lib/data/account";
import { avatarUrl, getMyProfile } from "@/lib/data/profile";
import { getRanking } from "@/lib/data/titles";
import { TITLE_MIN_GAMES } from "@/lib/titles";

export const metadata: Metadata = { title: "Comunidade" };

export default async function ComunidadePage() {
  const user = await requireUser("/comunidade");
  if (user.planRank < 1)
    return (
      <PlanRequired
        title="Ranking"
        text="O ranking da academia é para quem tem plano ativo."
      />
    );
  const [rows, profile] = await Promise.all([
    getRanking(50),
    getMyProfile(user.id),
  ]);
  const me = rows.find((row) => row.isMe);
  const top = rows.filter((row) => row.pos <= 50);

  let myNote: React.ReactNode = null;
  if (!profile.nickname)
    myNote = (
      <>
        Para aparecer no ranking, escolha um apelido em{" "}
        <Link href="/conta#perfil" className="text-accent-text hover:underline">
          Conta → Perfil
        </Link>
        .
      </>
    );
  else if (!profile.showInRanking)
    myNote = (
      <>
        Você escolheu não aparecer no ranking. Dá para mudar em{" "}
        <Link href="/conta#perfil" className="text-accent-text hover:underline">
          Conta → Perfil
        </Link>
        .
      </>
    );
  else if (!me)
    myNote = `Você entra no ranking depois de ${TITLE_MIN_GAMES} puzzles valendo rating.`;

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Comunidade</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Ranking da academia
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Rating de táticas dos alunos que escolheram aparecer. Aqui só aparecem
          apelido, foto, título e rating.
        </p>
        <p className="max-w-2xl rounded-control border border-border bg-surface-2 px-3 py-2 text-[0.8125rem] leading-relaxed text-muted">
          {RATING_DISCLAIMER}
        </p>
      </div>

      {myNote && (
        <p className="max-w-2xl text-[0.9375rem] text-muted">{myNote}</p>
      )}

      {rows.length === 0 ? (
        <p className="text-muted">
          O ranking começa quando os primeiros alunos completarem{" "}
          {TITLE_MIN_GAMES} puzzles.
        </p>
      ) : (
        <ol className="flex max-w-[720px] flex-col gap-2">
          {[...top, ...(me && me.pos > 50 ? [me] : [])].map((row) => (
            <li
              key={row.nickname}
              aria-current={row.isMe ? "true" : undefined}
              className={`flex items-center gap-3 rounded-card border px-4 py-3 ${
                row.isMe
                  ? "border-accent bg-surface-2"
                  : "border-border bg-surface"
              }`}
            >
              <span className="w-8 shrink-0 text-right font-display text-xl font-semibold text-muted tabular-nums">
                {row.pos}
              </span>
              <Avatar
                url={avatarUrl(row.avatarPath)}
                name={row.nickname}
                size={40}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="truncate font-semibold">
                  {row.nickname}
                  {row.isMe && (
                    <span className="ml-2 text-xs text-accent-text">você</span>
                  )}
                </span>
                {row.titleName && row.titleColor && (
                  <span>
                    <TitleBadge
                      name={row.titleName}
                      color={row.titleColor}
                      size="sm"
                    />
                  </span>
                )}
              </div>
              <span className="font-display text-2xl font-semibold tabular-nums">
                {row.rating.toLocaleString("pt-BR")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
