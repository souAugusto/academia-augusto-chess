import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { PLAN_NAMES, requireUser } from "@/lib/data/account";

export const metadata: Metadata = { title: "Pagamento enviado" };

// O Asaas manda o aluno para cá depois de pagar. Quem libera o acesso é o webhook,
// não esta página: ela só mostra o que o banco já sabe.
export default async function ConcluidoPage() {
  const user = await requireUser("/checkout/concluido");
  const active = user.planRank > 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SectionLabel>Assinatura</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {active ? "Bem-vindo à Finale" : "Pagamento em confirmação"}
        </h1>
      </div>
      <Card className="flex flex-col items-start gap-5 p-6 sm:p-8" highlight>
        <p className="leading-relaxed text-muted" aria-live="polite">
          {active
            ? `Seu plano ${PLAN_NAMES[user.planRank]} está ativo. Bom treino!`
            : "Assim que o Asaas confirmar o pagamento, o acesso é liberado sozinho. No Pix isso leva poucos segundos; no cartão, até alguns minutos. Atualize esta página para conferir."}
        </p>
        <div className="flex flex-wrap gap-3">
          {active ? (
            <Link href="/painel" className={buttonClasses("primary")}>
              Começar a treinar
            </Link>
          ) : (
            <Link
              href="/checkout/concluido"
              className={buttonClasses("primary")}
            >
              Atualizar
            </Link>
          )}
          <Link href="/conta" className={buttonClasses("secondary")}>
            Minha conta
          </Link>
        </div>
      </Card>
    </div>
  );
}
