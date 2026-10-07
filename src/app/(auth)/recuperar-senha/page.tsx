import type { Metadata } from "next";
import { RequestResetForm } from "@/components/auth/PasswordForms";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
};

export default function RecuperarSenhaPage() {
  return <RequestResetForm />;
}
