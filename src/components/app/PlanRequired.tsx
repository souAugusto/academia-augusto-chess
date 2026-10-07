import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";

// Mostrado no lugar do conteúdo quando a conta não tem o plano necessário.
// A proteção de verdade é o RLS e a checagem no servidor; isto é só a explicação.
export function PlanRequired({ title, text }: { title: string; text: string }) {
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
          <Link href="/planos" className={buttonClasses("primary")}>
            Ver planos
          </Link>
          <Link href="/puzzle-do-dia" className={buttonClasses("secondary")}>
            Resolver o puzzle do dia
          </Link>
        </div>
      </Card>
    </>
  );
}
