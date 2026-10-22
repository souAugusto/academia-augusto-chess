import { MotionProvider } from "@/components/motion/MotionProvider";
import type { Metadata } from "next";
import { StyleQuiz } from "@/components/style/StyleQuiz";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { safeNextPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Seu estilo de jogo" };

// Questionário de estilo. Logo depois do cadastro (next=/planos) ou pela conta.
export default async function QuestionarioPage({
  searchParams,
}: PageProps<"/questionario">) {
  const params = await searchParams;
  const next = safeNextPath(
    typeof params.next === "string" ? params.next : null,
    "/conta",
  );
  await requireUser(`/questionario?next=${encodeURIComponent(next)}`);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SectionLabel>Questionário</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Qual é o seu estilo de jogo?
        </h1>
        <p className="leading-relaxed text-muted">
          10 situações de partida. Escolha o que você faria de verdade, não o
          que acha certo. Leva uns 2 minutos e você pode refazer quando quiser.
        </p>
      </div>
      <Card className="p-5 sm:p-8">
        {/* Só o questionário usa framer-motion: o ajuste de "reduzir movimento" fica aqui. */}
        <MotionProvider>
          <StyleQuiz next={next} />
        </MotionProvider>
      </Card>
    </div>
  );
}
