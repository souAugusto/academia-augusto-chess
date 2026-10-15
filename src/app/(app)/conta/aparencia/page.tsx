import { redirect } from "next/navigation";

// A aparência agora fica em Minha conta, na seção Preferências.
export default function AparenciaPage() {
  redirect("/conta#preferencias");
}
