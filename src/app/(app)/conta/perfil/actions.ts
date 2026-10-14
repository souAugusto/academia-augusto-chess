"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { requireUser } from "@/lib/data/account";
import { siteOrigin } from "@/lib/origin";
import { getPaymentProvider } from "@/lib/payments";
import {
  NICKNAME_MESSAGES,
  nextNicknameChange,
  nicknameProblem,
} from "@/lib/profile/nickname";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  AVATAR_FORMATS,
  AVATAR_MAX_BYTES,
  AVATAR_SIZE,
  profileSchema,
} from "@/lib/validation/profile";
import { formatLongDate } from "@/lib/format";

export type ProfileState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
};

const AVATAR_BUCKET = "avatars";

// Nome, bio, WhatsApp e "aparecer no ranking". Gravado com o cliente do aluno:
// a RLS limita à própria linha.
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser("/conta/perfil");
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    showInRanking: formData.get("showInRanking") === "on",
  });
  if (!parsed.success)
    return {
      errors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
      ),
    };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      whatsapp: parsed.data.whatsapp ?? null,
      show_in_ranking: parsed.data.showInRanking,
    })
    .eq("id", user.id);
  if (error) return { message: "Não consegui salvar agora. Tente de novo." };
  revalidatePath("/conta");
  revalidatePath("/conta/perfil");
  return { ok: true, message: "Perfil salvo." };
}

// Apelido: regras no servidor (formato, palavras proibidas, reservados, único,
// troca a cada 30 dias). Gravado com a service role (o banco bloqueia a troca
// direta pelo aluno).
export async function setNickname(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser("/conta/perfil");
  const nickname = String(formData.get("nickname") ?? "").trim();
  const problem = nicknameProblem(nickname);
  if (problem) return { errors: { nickname: NICKNAME_MESSAGES[problem] } };

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("profiles")
    .select("display_name, display_name_changed_at")
    .eq("id", user.id)
    .single();
  if (current?.display_name === nickname) return { ok: true };
  // Só maiúsculas/minúsculas diferentes: ajuste livre, sem contar como troca.
  const sameName =
    current?.display_name?.toLowerCase() === nickname.toLowerCase();
  const next = sameName
    ? null
    : nextNicknameChange(
        current?.display_name_changed_at
          ? new Date(current.display_name_changed_at)
          : null,
      );
  if (next)
    return {
      errors: {
        nickname: `Você poderá trocar o apelido de novo em ${formatLongDate(next)}.`,
      },
    };

  const { error } = await admin
    .from("profiles")
    .update({
      display_name: nickname,
      ...(sameName
        ? {}
        : { display_name_changed_at: new Date().toISOString() }),
    })
    .eq("id", user.id);
  if (error?.code === "23505")
    return { errors: { nickname: NICKNAME_MESSAGES["em-uso"] } };
  if (error) return { message: "Não consegui salvar o apelido agora." };
  revalidatePath("/conta/perfil");
  revalidatePath("/conta");
  return { ok: true, message: "Apelido salvo." };
}

// Foto: confere o conteúdo de verdade (não a extensão), redimensiona para
// 256x256, converte para webp e grava sem metadados (EXIF, GPS).
export async function uploadAvatar(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser("/conta/perfil");
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0)
    return { errors: { avatar: "Escolha uma imagem." } };
  if (file.size > AVATAR_MAX_BYTES)
    return { errors: { avatar: "A imagem pode ter no máximo 2 MB." } };

  const input = Buffer.from(await file.arrayBuffer());
  let output: Buffer;
  try {
    const meta = await sharp(input).metadata();
    if (!(AVATAR_FORMATS as readonly string[]).includes(meta.format ?? ""))
      return { errors: { avatar: "Use uma imagem JPG, PNG ou WEBP." } };
    // rotate() aplica a orientação do EXIF antes de descartá-lo. O sharp não
    // copia metadados para a saída (sem withMetadata), então GPS e afins somem.
    output = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { errors: { avatar: "Não consegui ler essa imagem." } };
  }

  const admin = createAdminClient();
  const path = `${user.id}/avatar.webp`;
  const { error: uploadError } = await admin.storage
    .from(AVATAR_BUCKET)
    .upload(path, output, {
      contentType: "image/webp",
      upsert: true,
      cacheControl: "60",
    });
  if (uploadError) return { message: "Não consegui enviar a foto agora." };
  await admin.from("profiles").update({ avatar_path: path }).eq("id", user.id);
  revalidatePath("/conta/perfil");
  return { ok: true, message: "Foto atualizada." };
}

export async function removeAvatar(): Promise<ProfileState> {
  const user = await requireUser("/conta/perfil");
  const admin = createAdminClient();
  await admin.storage.from(AVATAR_BUCKET).remove([`${user.id}/avatar.webp`]);
  await admin.from("profiles").update({ avatar_path: null }).eq("id", user.id);
  revalidatePath("/conta/perfil");
  return { ok: true, message: "Foto removida." };
}

// Troca de e-mail pelo Supabase Auth: chega um link de confirmação.
export async function changeEmail(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  await requireUser("/conta/perfil");
  const parsed = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido."))
    .safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success)
    return { errors: { email: parsed.error.issues[0].message } };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data },
    {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent("/conta/perfil")}`,
    },
  );
  if (error)
    return {
      errors: {
        email: /already|registered|exists/i.test(error.message)
          ? "Esse e-mail já está em uso."
          : "Não consegui trocar o e-mail agora.",
      },
    };
  return {
    ok: true,
    message:
      "Enviamos um link de confirmação. A troca só vale depois de você confirmar pelo e-mail.",
  };
}

// Excluir conta: confirma digitando o apelido (ou o e-mail, se não tiver
// apelido), cancela a assinatura no Asaas, apaga foto e dados e desloga.
export async function deleteAccount(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser("/conta/perfil");
  const admin = createAdminClient();

  const [{ data: profile }, { data: isAdmin }] = await Promise.all([
    admin.from("profiles").select("display_name").eq("id", user.id).single(),
    admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (isAdmin)
    return {
      message:
        "Contas de administrador não podem ser excluídas por aqui. Tire o acesso de admin antes.",
    };
  const expected = (profile?.display_name ?? user.email).toLowerCase();
  const typed = String(formData.get("confirm") ?? "")
    .trim()
    .toLowerCase();
  if (typed !== expected)
    return {
      errors: {
        confirm: profile?.display_name
          ? "Digite o seu apelido exatamente como aparece."
          : "Digite o seu e-mail exatamente como aparece.",
      },
    };

  // 1. Assinaturas pagas: cancela a cobrança no Asaas antes de apagar.
  const { data: subs } = await admin
    .from("subscriptions")
    .select("id, source, status, provider_subscription_id")
    .eq("user_id", user.id);
  let canceled = 0;
  for (const sub of subs ?? []) {
    if (
      sub.source === "asaas" &&
      sub.provider_subscription_id &&
      ["active", "trialing", "past_due", "incomplete"].includes(sub.status)
    ) {
      try {
        await getPaymentProvider().cancelSubscription(
          sub.provider_subscription_id,
        );
        canceled++;
      } catch (error) {
        console.error("Excluir conta: falha ao cancelar no Asaas", error);
        return {
          message:
            "Não consegui cancelar sua assinatura agora, então a conta não foi excluída. Tente de novo em instantes.",
        };
      }
    }
  }

  // 2. Conta o que vai ser apagado (para o registro) e apaga o que não cai
  //    sozinho com o usuário.
  const count = async (table: string, column = "user_id") => {
    const { count: n } = await admin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(column, user.id);
    return n ?? 0;
  };
  const summary = {
    assinaturas: subs?.length ?? 0,
    assinaturas_canceladas_no_asaas: canceled,
    tentativas_de_puzzles: await count("attempts"),
    partidas_importadas: await count("imported_games"),
    analises: await count("game_analyses"),
    progresso_de_licoes: await count("lesson_study"),
    puzzles_personalizados: await count("puzzles", "created_by"),
    foto: Boolean(
      (
        await admin
          .from("profiles")
          .select("avatar_path")
          .eq("id", user.id)
          .single()
      ).data?.avatar_path,
    ),
  };
  await admin.storage.from(AVATAR_BUCKET).remove([`${user.id}/avatar.webp`]);
  await admin
    .from("puzzles")
    .delete()
    .eq("created_by", user.id)
    .eq("source", "custom");
  await admin.from("waitlist").delete().eq("user_id", user.id);

  // 3. Apaga o usuário: perfil, assinaturas, progresso e o resto caem juntos
  //    (on delete cascade). Eventos de pagamento ficam (registro fiscal).
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("Excluir conta:", error);
    return {
      message: "Não consegui excluir a conta agora. Fale com o suporte.",
    };
  }
  await admin.from("account_deletions").insert({ user_id: user.id, summary });
  console.info("Conta excluída", { userId: user.id, summary });

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?conta=excluida");
}
