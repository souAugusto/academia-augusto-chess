"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/account";
import { startTrialFor } from "@/lib/data/trial";

// Ativa o teste grátis do aluno logado. Usuário, elegibilidade e datas são
// decididos no servidor; o formulário não manda nada além do clique.
export async function startTrial(): Promise<void> {
  const user = await requireUser("/teste-gratis");
  const result = await startTrialFor({ id: user.id, email: user.email });
  if (result.ok) {
    // Atualiza o layout do app (faixa do teste) e as telas que mudam de acesso.
    revalidatePath("/", "layout");
    redirect("/painel?teste=ativado");
  }
  redirect(`/teste-gratis?motivo=${result.reason}`);
}
