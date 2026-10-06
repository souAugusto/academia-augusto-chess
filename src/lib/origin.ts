import "server-only";
import { headers } from "next/headers";

// Endereço público do site para montar links de e-mail e OAuth.
// Usa o host da requisição, então funciona em localhost, previews e produção.
// O Supabase só aceita destinos cadastrados em "Redirect URLs".
export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) throw new Error("Requisição sem host");
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
