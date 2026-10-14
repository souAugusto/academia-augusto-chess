import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/account/Avatar";
import {
  AvatarForm,
  DeleteAccountForm,
  DetailsForm,
  EmailForm,
  NicknameForm,
} from "@/components/account/ProfileForms";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";
import { getMyProfile } from "@/lib/data/profile";
import { formatLongDate } from "@/lib/format";
import { nextNicknameChange } from "@/lib/profile/nickname";

export const metadata: Metadata = { title: "Perfil" };

export default async function PerfilPage() {
  const user = await requireUser("/conta/perfil");
  const profile = await getMyProfile(user.id);
  const next = nextNicknameChange(profile.nicknameChangedAt);
  const shownName = profile.nickname ?? user.name;

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/conta" className="text-sm text-muted hover:text-text">
          ← Minha conta
        </Link>
        <SectionLabel>Conta</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Perfil
        </h1>
      </div>

      <div className="flex max-w-[640px] items-center gap-4 rounded-card border border-border bg-surface p-5">
        <Avatar url={profile.avatarUrl} name={shownName} size={56} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-semibold">
            {profile.nickname ?? "Sem apelido ainda"}
          </span>
          <span className="text-sm text-muted">
            Plano: {PLAN_NAMES[user.planRank] ?? "nenhum"} ·{" "}
            <Link href="/conta" className="text-accent-text hover:underline">
              ver assinatura
            </Link>
          </span>
        </div>
      </div>

      <NicknameForm
        nickname={profile.nickname}
        nextChange={next ? formatLongDate(next) : null}
      />
      <AvatarForm url={profile.avatarUrl} name={shownName} />
      <DetailsForm
        name={profile.name}
        bio={profile.bio}
        whatsapp={profile.whatsapp}
        showInRanking={profile.showInRanking}
      />
      <EmailForm email={user.email} />
      <DeleteAccountForm confirmWord={profile.nickname ?? user.email} />
    </>
  );
}
