import type { Metadata } from "next";
import { FinaleMark } from "@/components/brand/FinaleMark";

export const metadata: Metadata = {
  title: "Sem conexão",
  robots: { index: false },
};

// Mostrada pelo service worker quando não há internet e a página não está salva.
export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <FinaleMark className="size-16" />
      <h1 className="font-display text-page font-semibold">
        Você está sem conexão
      </h1>
      <p className="max-w-[420px] leading-relaxed text-muted">
        Assim que a internet voltar, é só recarregar a página para continuar o
        treino.
      </p>
    </main>
  );
}
