import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data/site-settings";

// Interruptores públicos do site, para o app conferir de tempos em tempos.
// Sem cache no navegador e na CDN (o service worker também não guarda /api/).
export async function GET() {
  return NextResponse.json(await getSiteSettings(), {
    headers: { "Cache-Control": "no-store" },
  });
}
