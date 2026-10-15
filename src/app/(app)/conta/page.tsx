import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { AccountNav } from "@/components/account/AccountNav";
import { Avatar } from "@/components/account/Avatar";
import { AvatarEditor } from "@/components/account/AvatarEditor";
import { CancelSubscription } from "@/components/account/CancelSubscription";
import { PreferencesSection } from "@/components/account/PreferencesSection";
import { DeleteAccountForm } from "@/components/account/PrivacyForms";
import { ProfileForm } from "@/components/account/ProfileForm";
import {
  EmailForm,
  PasswordForm,
  SignOutEverywhere,
} from "@/components/account/SecurityForms";
import {
  PaymentMethodForm,
  ReactivateForm,
} from "@/components/account/SubscriptionControls";
import { FormAlert } from "@/components/forms/Field";
import { LinkedAccounts } from "@/components/games/LinkedAccounts";
import { StyleBadge } from "@/components/style/StyleBadge";
import { TitleBadge } from "@/components/titles/TitleBadge";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { SectionCard } from "@/components/ui/SectionCard";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";
import {
  getGroupLinks,
  getMySubscriptions,
  getPaymentHistory,
  METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  STATUS_LABELS,
  type MySubscription,
} from "@/lib/data/billing";
import { getLinkedAccounts } from "@/lib/data/games";
import { getMyProfile } from "@/lib/data/profile";
import { getStreak } from "@/lib/data/progress";
import { getMyStyleHistory } from "@/lib/data/style";
import { getMyTacticStats } from "@/lib/data/tactics";
import { getMyTitleSummary } from "@/lib/data/titles";
import { getAccessStatus } from "@/lib/data/trial";
import {
  BUSINESS_TIME_ZONE,
  formatLongDate,
  formatPriceBRL,
} from "@/lib/format";
import { reactivationDueDate } from "@/lib/payments/rules";
import { nextNicknameChange } from "@/lib/profile/nickname";
import { STYLES } from "@/lib/style/styles";
import type { AccessStatus } from "@/lib/trial";
import { payPending } from "./actions";

export const metadata: Metadata = { title: "Minha conta" };
// As actions de importação de partidas (Contas vinculadas) usam este limite.
export const maxDuration = 120;

const monthYear = (date: Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    timeZone: BUSINESS_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(date);

function planLabel(access: AccessStatus, planRank: number): string {
  if (access.kind === "teste")
    return access.daysLeft === 1
      ? "Teste grátis: último dia"
      : `Teste grátis: ${access.daysLeft} dias restantes`;
  return PLAN_NAMES[planRank] ?? "Gratuito";
}

function Heading({ id, children }: { id: string; children: string }) {
  return (
    <h2
      id={`${id}-secao`}
      className="font-display text-2xl font-semibold tracking-tight"
    >
      {children}
    </h2>
  );
}

function Rows({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="flex flex-col">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-wrap justify-between gap-2 border-b border-border py-3 last:border-b-0"
        >
          <dt className="text-muted">{row.label}</dt>
          <dd className="font-semibold">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Stat({
  label,
  value,
  empty,
}: {
  label: string;
  value: string | null;
  empty: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-control bg-surface-2 px-4 py-3">
      <span className="text-sm text-muted">{label}</span>
      {value === null ? (
        <span className="text-[0.9375rem]">{empty}</span>
      ) : (
        <span className="font-display text-3xl font-semibold tabular-nums">
          {value}
        </span>
      )}
    </div>
  );
}

function subscriptionRows(sub: MySubscription) {
  const rows = [{ label: "Plano", value: sub.planName }];
  if (sub.source === "asaas" && sub.planPriceCents)
    rows.push({
      label: "Valor",
      value: `${formatPriceBRL(sub.planPriceCents)} por mês`,
    });
  rows.push({
    label: "Situação",
    value: sub.cancelAtPeriodEnd
      ? "Cancelada (sem renovação)"
      : STATUS_LABELS[sub.status],
  });
  if (sub.billingType)
    rows.push({ label: "Pagamento", value: METHOD_LABELS[sub.billingType] });
  if (sub.currentPeriodEnd)
    rows.push({
      label:
        sub.cancelAtPeriodEnd || sub.source === "manual"
          ? "Acesso até"
          : "Próxima renovação",
      value: formatLongDate(sub.currentPeriodEnd),
    });
  if (sub.source === "manual")
    rows.push({ label: "Origem", value: "Concedido pela Finale" });
  return rows;
}

export default async function ContaPage({ searchParams }: PageProps<"/conta">) {
  const user = await requireUser("/conta");
  const [
    params,
    profile,
    access,
    subscriptions,
    history,
    styles,
    stats,
    streak,
    titles,
    accounts,
  ] = await Promise.all([
    searchParams,
    getMyProfile(user.id, user.socialAvatarUrl),
    getAccessStatus({ id: user.id, email: user.email }),
    getMySubscriptions(user.id),
    getPaymentHistory(user.id),
    getMyStyleHistory(user.id),
    getMyTacticStats(user.id),
    getStreak(user.id),
    getMyTitleSummary(user.id),
    getLinkedAccounts(),
  ]);
  const groups = await getGroupLinks(user.planRank);
  const currentStyle = styles[0];
  const displayName = profile.name || user.name;
  const next = nextNicknameChange(profile.nicknameChangedAt);
  const hasPassword = user.providers.includes("email");
  const renewing = subscriptions.some(
    (sub) =>
      sub.source === "asaas" &&
      ["active", "past_due", "incomplete"].includes(sub.status) &&
      !sub.cancelAtPeriodEnd,
  );

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Conta</SectionLabel>
        <h1 className="font-display text-page font-bold">Minha conta</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <AccountNav />

        <div className="flex min-w-0 flex-col gap-12">
          {/* ---------------- PERFIL ---------------- */}
          <section
            id="perfil"
            aria-labelledby="perfil-secao"
            className="flex scroll-mt-24 flex-col gap-5"
          >
            <Heading id="perfil">Perfil</Heading>
            <div className="flex flex-wrap items-center gap-5 rounded-card border border-border bg-surface p-5 shadow-card sm:p-6">
              <Avatar
                url={profile.avatarUrl}
                name={profile.nickname ?? displayName}
                size={80}
                decorative
              />
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-xl font-semibold">
                  {displayName}
                  {profile.nickname && (
                    <span className="ml-2 text-base font-normal text-muted">
                      @{profile.nickname}
                    </span>
                  )}
                </span>
                <span className="text-[0.9375rem] break-all text-muted">
                  {user.email}
                </span>
                <span className="text-sm text-muted">
                  Membro desde {monthYear(user.createdAt)}
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full border border-accent px-3 py-0.5 text-sm font-semibold text-accent-text">
                    {planLabel(access, user.planRank)}
                  </span>
                  {titles.current && (
                    <TitleBadge
                      name={titles.current.name}
                      color={titles.current.color}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            <SectionCard id="foto" title="Foto">
              <AvatarEditor
                url={profile.avatarUrl}
                name={profile.nickname ?? displayName}
                hasUploaded={profile.hasUploadedAvatar}
              />
            </SectionCard>

            <SectionCard id="dados" title="Dados do perfil">
              <ProfileForm
                initial={{
                  name: profile.name,
                  nickname: profile.nickname ?? "",
                  location: profile.location,
                  bio: profile.bio,
                  declaredRating: profile.declaredRating
                    ? String(profile.declaredRating)
                    : "",
                  whatsapp: profile.whatsapp,
                  showInRanking: profile.showInRanking,
                }}
                nicknameHint={
                  next
                    ? `Você poderá trocar de novo em ${formatLongDate(next)}. Ajustar maiúsculas e minúsculas é livre.`
                    : "3 a 20 caracteres: letras sem acento, números, _, . ou -. Aparece no ranking. Dá para trocar uma vez a cada 30 dias."
                }
              />
            </SectionCard>

            <SectionCard id="progresso" title="Seu progresso">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat
                  label="Rating de táticas"
                  value={stats.games > 0 ? String(stats.rating) : null}
                  empty="Resolva seu primeiro puzzle para ganhar um rating."
                />
                <Stat
                  label="Sequência atual"
                  value={
                    streak.current > 0
                      ? `${streak.current} ${streak.current === 1 ? "dia" : "dias"}`
                      : null
                  }
                  empty="Treine hoje para começar uma sequência."
                />
                <Stat
                  label="Recorde de sequência"
                  value={
                    streak.best > 0
                      ? `${streak.best} ${streak.best === 1 ? "dia" : "dias"}`
                      : null
                  }
                  empty="Seu recorde aparece aqui."
                />
                <Stat
                  label="Puzzles resolvidos"
                  value={stats.solved > 0 ? String(stats.solved) : null}
                  empty="Nenhum ainda. Que tal o puzzle do dia?"
                />
              </div>
              <Link
                href="/taticas"
                className={buttonClasses("secondary", "md", "self-start")}
              >
                Treinar táticas
              </Link>
            </SectionCard>

            <SectionCard id="estilo" title="Estilo de jogo">
              {currentStyle ? (
                <>
                  <div>
                    <StyleBadge style={currentStyle.style} />
                  </div>
                  <p className="text-[0.9375rem] leading-relaxed text-muted">
                    {STYLES[currentStyle.style].description}
                  </p>
                  <Link
                    href="/questionario?next=%2Fconta"
                    className={buttonClasses("secondary", "md", "self-start")}
                  >
                    Refazer o questionário
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[0.9375rem] text-muted">
                    Em 2 minutos você descobre seu estilo de jogo.
                  </p>
                  <Link
                    href="/questionario?next=%2Fconta"
                    className={buttonClasses("primary", "md", "self-start")}
                  >
                    Fazer o questionário
                  </Link>
                </>
              )}
            </SectionCard>
          </section>

          {/* ---------------- ASSINATURA ---------------- */}
          <section
            id="assinatura"
            aria-labelledby="assinatura-secao"
            className="flex scroll-mt-24 flex-col gap-5"
          >
            <Heading id="assinatura">Assinatura</Heading>
            {params.pagamento === "indisponivel" && (
              <FormAlert tone="erro">
                Não encontramos uma cobrança em aberto agora. Tente de novo em
                instantes.
              </FormAlert>
            )}

            {access.kind === "teste" && (
              <SectionCard
                id="teste"
                title={
                  access.daysLeft === 1
                    ? "Teste grátis: último dia"
                    : `Teste grátis: ${access.daysLeft} dias restantes`
                }
                description={`Plano Membro até ${formatLongDate(access.endsAt)}. Nada é cobrado ao fim.`}
              >
                <Link
                  href="/checkout?plano=membro"
                  className={buttonClasses("primary", "md", "self-start")}
                >
                  Assinar agora
                </Link>
              </SectionCard>
            )}
            {access.kind === "teste-expirado" && subscriptions.length === 0 && (
              <SectionCard
                id="teste"
                title="Seu teste grátis terminou"
                description={`Terminou em ${formatLongDate(access.endsAt)}. Seu progresso continua guardado.`}
              >
                <Link
                  href="/checkout?plano=membro"
                  className={buttonClasses("primary", "md", "self-start")}
                >
                  Assinar o Membro
                </Link>
              </SectionCard>
            )}

            {subscriptions.length === 0 && access.kind !== "teste" && (
              <SectionCard
                id="sem-plano"
                title="Plano atual: Gratuito"
                description="Você ainda não tem assinatura. Com o plano Membro você treina táticas, aberturas, finais, aulas e análise."
              >
                <div className="flex flex-wrap gap-3">
                  {access.kind === "gratuito" && access.eligible && (
                    <Link
                      href="/teste-gratis"
                      className={buttonClasses("primary")}
                    >
                      Começar 30 dias grátis
                    </Link>
                  )}
                  <Link href="/planos" className={buttonClasses("secondary")}>
                    Ver planos
                  </Link>
                </div>
              </SectionCard>
            )}

            {subscriptions.map((sub) => {
              const reactivateOn =
                sub.source === "asaas"
                  ? reactivationDueDate({
                      status: sub.status,
                      currentPeriodEnd:
                        sub.currentPeriodEnd?.toISOString() ?? null,
                      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
                    })
                  : null;
              const canManage =
                sub.source === "asaas" && !sub.cancelAtPeriodEnd;
              return (
                <SectionCard
                  key={sub.id}
                  id={`plano-${sub.id}`}
                  title={`Plano ${sub.planName}`}
                >
                  <Rows rows={subscriptionRows(sub)} />
                  <div className="flex flex-wrap gap-3">
                    {(sub.status === "incomplete" ||
                      sub.status === "past_due") &&
                      canManage && (
                        <form action={payPending}>
                          <input
                            type="hidden"
                            name="subscriptionId"
                            value={sub.id}
                          />
                          <button
                            type="submit"
                            className={buttonClasses("primary")}
                          >
                            Pagar agora
                          </button>
                        </form>
                      )}
                    <Link href="/planos" className={buttonClasses("secondary")}>
                      Mudar de plano
                    </Link>
                    {canManage && sub.status !== "incomplete" && (
                      <PaymentMethodForm
                        subscriptionId={sub.id}
                        current={sub.billingType}
                      />
                    )}
                  </div>
                  {canManage && (
                    <CancelSubscription
                      subscriptionId={sub.id}
                      accessUntil={
                        sub.status === "incomplete" || !sub.currentPeriodEnd
                          ? null
                          : formatLongDate(sub.currentPeriodEnd)
                      }
                    />
                  )}
                  {reactivateOn && (
                    <ReactivateForm
                      subscriptionId={sub.id}
                      nextCharge={formatLongDate(
                        new Date(`${reactivateOn}T12:00:00-03:00`),
                      )}
                    />
                  )}
                </SectionCard>
              );
            })}

            <SectionCard id="historico" title="Histórico de pagamentos">
              {history.kind === "erro" ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-[0.9375rem] text-muted">
                    Não consegui carregar o histórico agora.
                  </p>
                  <Link
                    href="/conta#assinatura"
                    className={buttonClasses("secondary")}
                  >
                    Tentar de novo
                  </Link>
                </div>
              ) : history.kind === "indisponivel" ||
                history.payments.length === 0 ? (
                <p className="text-[0.9375rem] text-muted">
                  Seus pagamentos e recibos aparecem aqui depois da primeira
                  cobrança.
                </p>
              ) : (
                <ul className="flex flex-col">
                  {history.payments.map((payment) => (
                    <li
                      key={payment.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {formatPriceBRL(payment.valueCents)} ·{" "}
                          {payment.planName}
                        </span>
                        <span className="text-sm text-muted">
                          Vencimento{" "}
                          {formatLongDate(
                            new Date(`${payment.dueDate}T12:00:00-03:00`),
                          )}
                          {payment.method &&
                            ` · ${METHOD_LABELS[payment.method]}`}
                          {" · "}
                          {PAYMENT_STATUS_LABELS[payment.status] ??
                            payment.status}
                        </span>
                      </div>
                      {(payment.receiptUrl ?? payment.invoiceUrl) && (
                        <a
                          href={payment.receiptUrl ?? payment.invoiceUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-touch content-center text-sm font-semibold text-accent-text underline-offset-4 hover:underline"
                        >
                          {payment.receiptUrl ? "Ver recibo" : "Ver cobrança"}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {groups.length > 0 && (
              <SectionCard id="grupos" title="Grupos no WhatsApp">
                <div className="flex flex-wrap gap-3">
                  {groups.map((group) => (
                    <a
                      key={group.url}
                      href={group.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses("outline-accent")}
                    >
                      {group.label}
                    </a>
                  ))}
                </div>
              </SectionCard>
            )}
          </section>

          {/* ---------------- SEGURANÇA ---------------- */}
          <section
            id="seguranca"
            aria-labelledby="seguranca-secao"
            className="flex scroll-mt-24 flex-col gap-5"
          >
            <Heading id="seguranca">Segurança</Heading>
            <SectionCard id="email" title="E-mail">
              <EmailForm email={user.email} />
            </SectionCard>
            <SectionCard
              id="senha"
              title="Senha"
              description={
                hasPassword
                  ? undefined
                  : "Você entra com o Google, então a senha é gerenciada pela sua conta Google."
              }
            >
              {hasPassword ? (
                <PasswordForm />
              ) : (
                <Link
                  href="/recuperar-senha"
                  className={buttonClasses("secondary", "md", "self-start")}
                >
                  Criar uma senha da Finale
                </Link>
              )}
            </SectionCard>
            <SectionCard
              id="sessoes"
              title="Aparelhos conectados"
              description="Se você entrou em um aparelho que não é seu, saia de todos de uma vez."
            >
              <SignOutEverywhere />
              <form action={signOut}>
                <button type="submit" className={buttonClasses("ghost")}>
                  Sair só deste aparelho
                </button>
              </form>
            </SectionCard>
          </section>

          {/* ---------------- PREFERÊNCIAS ---------------- */}
          <section
            id="preferencias"
            aria-labelledby="preferencias-secao"
            className="flex scroll-mt-24 flex-col gap-5"
          >
            <Heading id="preferencias">Preferências</Heading>
            <PreferencesSection />
          </section>

          {/* ---------------- CONTAS VINCULADAS ---------------- */}
          <section
            id="contas-vinculadas"
            aria-labelledby="contas-vinculadas-secao"
            className="flex scroll-mt-24 flex-col gap-5"
          >
            <Heading id="contas-vinculadas">Contas vinculadas</Heading>
            {user.planRank >= 1 ? (
              <>
                <p className="text-[0.9375rem] text-muted">
                  Vincule seu usuário do Chess.com ou do Lichess para importar
                  suas partidas públicas. As estatísticas ficam em{" "}
                  <Link
                    href="/partidas"
                    className="text-accent-text hover:underline"
                  >
                    Minhas partidas
                  </Link>
                  .
                </p>
                <LinkedAccounts accounts={accounts} />
              </>
            ) : (
              <SectionCard
                id="vinculo-plano"
                title="Faz parte da assinatura"
                description="A importação de partidas do Chess.com e do Lichess é para quem tem plano ativo."
              >
                <Link
                  href="/planos"
                  className={buttonClasses("secondary", "md", "self-start")}
                >
                  Ver planos
                </Link>
              </SectionCard>
            )}
          </section>

          {/* ---------------- PRIVACIDADE ---------------- */}
          <section
            id="privacidade"
            aria-labelledby="privacidade-secao"
            className="flex scroll-mt-24 flex-col gap-5"
          >
            <Heading id="privacidade">Privacidade</Heading>
            <SectionCard
              id="dados-pessoais"
              title="Seus dados"
              description="Baixe uma cópia de tudo o que a Finale guarda sobre você (perfil, progresso, partidas e assinaturas), em JSON."
            >
              <a
                href="/api/conta/exportar"
                download
                className={buttonClasses("secondary", "md", "self-start")}
              >
                Baixar meus dados
              </a>
              <p className="text-sm text-muted">
                Leia os{" "}
                <Link
                  href="/termos"
                  className="text-accent-text hover:underline"
                >
                  Termos de uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacidade"
                  className="text-accent-text hover:underline"
                >
                  Política de privacidade
                </Link>
                .
              </p>
            </SectionCard>
            <SectionCard id="excluir" title="Excluir minha conta" tone="danger">
              <DeleteAccountForm renewing={renewing} />
            </SectionCard>
          </section>
        </div>
      </div>
    </>
  );
}
