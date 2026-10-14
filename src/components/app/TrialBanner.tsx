import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { getAccessStatus } from "@/lib/data/trial";
import { createClient } from "@/lib/supabase/server";

// Faixa discreta no topo do app durante o teste grátis. Nos últimos 7 dias
// e no último dia ganha mais destaque, sem bloquear a navegação.
export async function TrialBanner() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims.sub;
  const email = data?.claims.email;
  if (!id || typeof email !== "string") return null;
  const status = await getAccessStatus({ id, email });
  if (status.kind !== "teste") return null;

  const lastDay = status.daysLeft === 1;
  const ending = status.daysLeft <= 7;
  const text = lastDay
    ? "Último dia do seu teste grátis."
    : `Teste grátis: ${status.daysLeft} dias restantes.`;

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-between gap-3 rounded-card border px-4 py-3 ${
        ending ? "border-accent bg-surface-2" : "border-border bg-surface"
      }`}
    >
      <p
        className={`text-[0.9375rem] ${ending ? "font-semibold" : "text-muted"}`}
      >
        {text}
        {ending && (
          <span className="font-normal text-muted">
            {" "}
            Assine para continuar treinando sem interrupção.
          </span>
        )}
      </p>
      <Link
        href="/checkout?plano=membro"
        className={buttonClasses(
          ending ? "primary" : "secondary",
          "md",
          "!min-h-0 !py-2",
        )}
      >
        Assinar agora
      </Link>
    </div>
  );
}
