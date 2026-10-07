import type { Metadata } from "next";
import { NewPasswordForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Nova senha",
};

// Só abre com sessão: o link do e-mail passa por /auth/confirm, que faz o login
// temporário. Sem sessão, o proxy manda para /entrar.
export default function RedefinirSenhaPage() {
  return <NewPasswordForm />;
}
