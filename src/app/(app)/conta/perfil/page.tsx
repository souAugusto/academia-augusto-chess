import { redirect } from "next/navigation";

// O perfil agora fica na página Minha conta.
export default function PerfilPage() {
  redirect("/conta#perfil");
}
