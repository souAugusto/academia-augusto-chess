import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/button";

// Área desligada pelo admin (interruptores do site): aviso amigável no lugar
// do conteúdo, sem erro técnico.
export function AreaUnavailable({ title }: { title: string }) {
  return (
    <Card className="flex max-w-2xl flex-col items-start gap-4">
      <h1 className="font-display text-page font-semibold tracking-tight">
        {title}
      </h1>
      <p className="leading-relaxed text-muted">
        Esta área está temporariamente indisponível. Seu progresso continua
        guardado e volta a aparecer assim que ela for liberada.
      </p>
      <Link href="/painel" className={buttonClasses("primary")}>
        Voltar ao painel
      </Link>
    </Card>
  );
}
