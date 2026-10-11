import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Tudo, exceto arquivos estáticos, imagens e o webhook de pagamento.
    "/((?!_next/static|_next/image|favicon.ico|api/pagamentos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
