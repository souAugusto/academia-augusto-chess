import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { TRIAL_NOTE } from "@/content/trial";
import { getAccessStatus } from "@/lib/data/trial";
import { formatLongDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const KEPT = [
  "Rating de táticas e títulos",
  "Sequência de dias e progresso nas lições",
  "Partidas importadas e análises salvas",
  "Erros guardados para revisão",
];
const LOST = [
  "Táticas, aberturas, finais e lições",
  "Aulas em vídeo com PDF e PGN",
  "Análise de partidas com o motor",
  "Lives, ranking e grupo no WhatsApp",
];

// Mostrado no lugar do conteúdo quando a conta não tem o plano necessário.
// A proteção de verdade é o RLS e a checagem no servidor; isto é só a explicação.
// Para conteúdo do Membro, mostra também o teste grátis (convite ou fim do teste).
export async function PlanRequired({
  title,
  text,
  plan = "membro",
}: {
  title: string;
  text: string;
  plan?: "membro" | "intensivo";
}) {
  let status = null;
  if (plan === "membro") {
    const { data } = await (await createClient()).auth.getClaims();
    const id = data?.claims.sub;
    const email = data?.claims.email;
    if (id && typeof email === "string")
      status = await getAccessStatus({ id, email });
  }

  if (status?.kind === "teste-expirado")
    return (
      <>
        <div className="flex flex-col gap-2">
          <SectionLabel>Teste grátis</SectionLabel>
          <h1 className="font-display text-page font-semibold tracking-tight">
            Seu teste grátis terminou
          </h1>
          <p className="max-w-xl leading-relaxed text-muted">
            Foram 30 dias de plano Membro, até {formatLongDate(status.endsAt)}.
            Seu progresso continua guardado: assine para continuar de onde
            parou.
          </p>
        </div>
        <Card className="flex flex-col gap-6 p-7" highlight>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Continua com você</h2>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem] text-muted">
                {KEPT.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold">Volta com a assinatura</h2>
              <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[0.9375rem] text-muted">
                {LOST.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/checkout?plano=membro"
              className={buttonClasses("primary", "lg")}
            >
              Assinar o Membro
            </Link>
            <Link href="/planos" className={buttonClasses("secondary", "lg")}>
              Ver planos
            </Link>
          </div>
          <p className="text-sm text-muted">Pague com Pix ou cartão.</p>
        </Card>
      </>
    );

  const canTry = status?.kind === "gratuito" && status.eligible;
  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Assinatura</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <Card className="flex flex-col items-start gap-5 p-8" highlight>
        <p className="max-w-xl leading-relaxed text-muted">{text}</p>
        <div className="flex flex-wrap gap-3">
          {canTry ? (
            <>
              <Link href="/teste-gratis" className={buttonClasses("primary")}>
                Começar 30 dias grátis
              </Link>
              <Link href="/planos" className={buttonClasses("secondary")}>
                Ver planos
              </Link>
            </>
          ) : (
            <>
              <Link href="/planos" className={buttonClasses("primary")}>
                Ver planos
              </Link>
              <Link
                href="/puzzle-do-dia"
                className={buttonClasses("secondary")}
              >
                Resolver o puzzle do dia
              </Link>
            </>
          )}
        </div>
        {canTry && <p className="text-sm text-muted">{TRIAL_NOTE}</p>}
      </Card>
    </>
  );
}
