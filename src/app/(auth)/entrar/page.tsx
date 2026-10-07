import type { Metadata } from "next";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { GoogleButton, OrDivider } from "@/components/auth/GoogleButton";
import { HOME_LOGGED_IN, safeNextPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Entrar" };

const NOTICES: Record<string, string> = {
  link: "O link expirou ou já foi usado. Entre com sua senha ou peça um novo link.",
  google:
    "Não foi possível entrar com o Google agora. Tente de novo ou use e-mail e senha.",
};

export default async function EntrarPage({
  searchParams,
}: PageProps<"/entrar">) {
  const params = await searchParams;
  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const tab = one(params.aba) === "criar" ? "criar" : "entrar";
  const next = safeNextPath(one(params.next), HOME_LOGGED_IN);
  const erro = one(params.erro);

  return (
    <>
      <AuthTabs
        initialTab={tab}
        next={next}
        notice={erro ? NOTICES[erro] : undefined}
      />
      <OrDivider />
      <GoogleButton next={tab === "criar" ? "/planos" : next} />
    </>
  );
}
