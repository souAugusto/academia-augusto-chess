"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { requireUser } from "@/lib/data/account";
import { publicEnv } from "@/lib/env";
import { formatLongDate } from "@/lib/format";
import { siteOrigin } from "@/lib/origin";
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
  DELETE_CONFIRM_WORD,
  passwordChangeSchema,
  profileSchema,
} from "@/lib/validation/profile";

export type ProfileState = {
  ok?: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
};

const AVATAR_BUCKET = "avatars";
const CONTA = "/conta";

// Depois de mudar foto ou nome, o cabeçalho (layout) e a conta se atualizam.
function refreshAccount() {
  revalidatePath("/", "layout");
}

// Nome, bio, WhatsApp, cidade, rating declarado e "aparecer no ranking".
// Gravado com o cliente do aluno: a RLS limita à própria linha.
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser(CONTA);
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    location: String(formData.get("location") ?? ""),
    declaredRating: String(formData.get("declaredRating") ?? ""),
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
      location: parsed.data.location || null,
      declared_rating: parsed.data.declaredRating,
      show_in_ranking: parsed.data.showInRanking,
    })
    .eq("id", user.id);
  if (error)
    return { message: "Não consegui salvar o perfil agora. Tente de novo." };
  refreshAccount();
  return { ok: true, message: "Perfil salvo." };
}

// Confere o apelido enquanto o aluno digita (formato, palavras proibidas,
// reservados, prazo de 30 dias e se outra pessoa já usa).
export async function checkNickname(
  nickname: string,
): Promise<{ ok: boolean; message: string }> {
  const user = await requireUser(CONTA);
  const value = nickname.trim();
  const problem = nicknameProblem(value);
  if (problem) return { ok: false, message: NICKNAME_MESSAGES[problem] };
  const admin = createAdminClient();
  const [{ data: mine }, { data: taken }] = await Promise.all([
    admin
      .from("profiles")
      .select("display_name, display_name_changed_at")
      .eq("id", user.id)
      .single(),
    admin
      .from("profiles")
      .select("id")
      .eq("display_name", value)
      .neq("id", user.id)
      .maybeSingle(),
  ]);
  if (mine?.display_name === value)
    return { ok: true, message: "Este é o seu apelido atual." };
  if (taken) return { ok: false, message: NICKNAME_MESSAGES["em-uso"] };
  const sameName = mine?.display_name?.toLowerCase() === value.toLowerCase();
  const next = sameName
    ? null
    : nextNicknameChange(
        mine?.display_name_changed_at
          ? new Date(mine.display_name_changed_at)
          : null,
      );
  if (next)
    return {
      ok: false,
      message: `Você poderá trocar o apelido de novo em ${formatLongDate(next)}.`,
    };
  return { ok: true, message: "Disponível." };
}

// Apelido: regras no servidor (formato, palavras proibidas, reservados, único,
// troca a cada 30 dias). Gravado com a service role (o banco bloqueia a troca
// direta pelo aluno).
export async function setNickname(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser(CONTA);
  const nickname = String(formData.get("nickname") ?? "").trim();
  const check = await checkNickname(nickname);
  if (!check.ok) return { errors: { nickname: check.message } };
  if (check.message === "Este é o seu apelido atual.")
    return { ok: true, message: "Nada mudou no apelido." };

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  const sameName =
    current?.display_name?.toLowerCase() === nickname.toLowerCase();
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
  refreshAccount();
  return { ok: true, message: "Apelido salvo." };
}

// Arquivos de foto na pasta do aluno (para apagar a anterior ao trocar).
async function avatarFiles(userId: string): Promise<string[]> {
  const { data } = await createAdminClient()
    .storage.from(AVATAR_BUCKET)
    .list(userId);
  return (data ?? []).map((file) => `${userId}/${file.name}`);
}

// Foto: o navegador já recorta e reduz, mas o servidor confere o conteúdo de
// verdade (não a extensão), refaz em 512x512 webp e grava sem metadados
// (EXIF, GPS), com nome único. A foto anterior é apagada.
export async function uploadAvatar(formData: FormData): Promise<ProfileState> {
  const user = await requireUser(CONTA);
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
    return {
      errors: { avatar: "Não consegui ler essa imagem. Tente outra foto." },
    };
  }

  const admin = createAdminClient();
  const previous = await avatarFiles(user.id);
  const path = `${user.id}/avatar-${Date.now()}.webp`;
  const { error: uploadError } = await admin.storage
    .from(AVATAR_BUCKET)
    .upload(path, output, {
      contentType: "image/webp",
      cacheControl: "31536000",
    });
  if (uploadError)
    return { message: "Não consegui enviar a foto agora. Tente de novo." };
  const { error } = await admin
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", user.id);
  if (error) {
    await admin.storage.from(AVATAR_BUCKET).remove([path]);
    return { message: "Não consegui salvar a foto agora. Tente de novo." };
  }
  if (previous.length) await admin.storage.from(AVATAR_BUCKET).remove(previous);
  refreshAccount();
  return { ok: true, message: "Foto atualizada." };
}

export async function removeAvatar(): Promise<ProfileState> {
  const user = await requireUser(CONTA);
  const admin = createAdminClient();
  const files = await avatarFiles(user.id);
  if (files.length) await admin.storage.from(AVATAR_BUCKET).remove(files);
  await admin.from("profiles").update({ avatar_path: null }).eq("id", user.id);
  refreshAccount();
  return { ok: true, message: "Foto removida." };
}

// Troca de e-mail pelo Supabase Auth: chega um link de confirmação.
export async function changeEmail(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser(CONTA);
  const parsed = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido, ex.: nome@gmail.com."))
    .safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success)
    return { errors: { email: parsed.error.issues[0].message } };
  if (parsed.data === user.email.toLowerCase())
    return { errors: { email: "Este já é o seu e-mail." } };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data },
    {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm?next=${encodeURIComponent(CONTA)}`,
    },
  );
  if (error)
    return {
      errors: {
        email: /already|registered|exists/i.test(error.message)
          ? "Esse e-mail já está em uso em outra conta."
          : "Não consegui trocar o e-mail agora. Tente de novo.",
      },
    };
  return {
    ok: true,
    message:
      "Enviamos um link de confirmação. A troca só vale depois que você confirmar pelo e-mail.",
  };
}

// Troca de senha: confere a senha atual antes (com um cliente sem sessão,
// só para validar) e grava a nova na sessão do aluno.
export async function changePassword(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser(CONTA);
  const parsed = passwordChangeSchema.safeParse({
    current: String(formData.get("current") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success)
    return {
      errors: Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
      ),
    };
  const env = publicEnv();
  const checker = createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { error: wrong } = await checker.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current,
  });
  if (wrong) return { errors: { current: "A senha atual não confere." } };
  await checker.auth.signOut({ scope: "local" });
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return {
      errors: {
        password:
          error.code === "weak_password"
            ? "Escolha uma senha mais forte (misture letras, números e símbolos)."
            : "Não consegui trocar a senha agora. Tente de novo.",
      },
    };
  return { ok: true, message: "Senha alterada." };
}

// Encerra a sessão em todos os aparelhos (inclusive este).
export async function signOutEverywhere(): Promise<void> {
  await requireUser(CONTA);
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/entrar?erro=sessoes");
}

// Excluir conta: confirma digitando EXCLUIR. Assinatura paga com renovação
// ativa precisa ser cancelada antes (na seção Assinatura). Apaga foto, dados e
// desloga; registra o que foi apagado.
export async function deleteAccount(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser(CONTA);
  const admin = createAdminClient();

  const typed = String(formData.get("confirm") ?? "").trim();
  if (typed !== DELETE_CONFIRM_WORD)
    return {
      errors: {
        confirm: `Digite ${DELETE_CONFIRM_WORD} em letras maiúsculas para confirmar.`,
      },
    };
  const [{ data: isAdmin }, { data: subs }] = await Promise.all([
    admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
    admin
      .from("subscriptions")
      .select("id, source, status, cancel_at_period_end")
      .eq("user_id", user.id),
  ]);
  if (isAdmin)
    return {
      message:
        "Contas de administrador não podem ser excluídas por aqui. Tire o acesso de admin antes.",
    };
  const renewing = (subs ?? []).some(
    (sub) =>
      sub.source === "asaas" &&
      ["active", "past_due", "incomplete"].includes(sub.status) &&
      !sub.cancel_at_period_end,
  );
  if (renewing)
    return {
      message:
        "Você tem uma assinatura com renovação ativa. Cancele a assinatura na seção Assinatura antes de excluir a conta.",
    };

  const count = async (table: string, column = "user_id") => {
    const { count: n } = await admin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(column, user.id);
    return n ?? 0;
  };
  const files = await avatarFiles(user.id);
  const summary = {
    assinaturas: subs?.length ?? 0,
    tentativas_de_puzzles: await count("attempts"),
    partidas_importadas: await count("imported_games"),
    analises: await count("game_analyses"),
    progresso_de_licoes: await count("lesson_study"),
    puzzles_personalizados: await count("puzzles", "created_by"),
    fotos: files.length,
  };
  if (files.length) await admin.storage.from(AVATAR_BUCKET).remove(files);
  await admin
    .from("puzzles")
    .delete()
    .eq("created_by", user.id)
    .eq("source", "custom");
  await admin.from("waitlist").delete().eq("user_id", user.id);

  // Perfil, assinaturas, progresso e o resto caem juntos (on delete cascade).
  // Eventos de pagamento ficam (registro fiscal).
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
  redirect("/entrar?erro=excluida");
}
