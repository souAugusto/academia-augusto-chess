import { getPaymentProvider } from "@/lib/payments";
import { parseAsaasEvent, tokenMatches } from "@/lib/payments/asaas-webhook";
import { syncSubscriptionEvent } from "@/lib/payments/sync";
import { createAdminClient } from "@/lib/supabase/admin";

// Webhook do Asaas. Confere o token do header, grava o id do evento (idempotência:
// o Asaas entrega "pelo menos uma vez") e atualiza a assinatura.
// Responde 200 para o que não é da Finale, para não travar a fila do Asaas.

const MAX_BODY = 100_000;

export async function POST(request: Request) {
  if (
    !tokenMatches(
      request.headers.get("asaas-access-token"),
      process.env.ASAAS_WEBHOOK_TOKEN ?? "",
    )
  ) {
    return new Response("Não autorizado", { status: 401 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY)
    return new Response("Corpo grande demais", { status: 413 });
  const event = parseAsaasEvent(raw);
  if (!event) {
    console.warn("Webhook Asaas: formato não reconhecido.");
    return Response.json({ ok: true, ignored: true });
  }

  const admin = createAdminClient();
  const { error: insertError } = await admin
    .from("payment_events")
    .insert({ id: event.id, type: event.event, provider: "asaas" });
  if (insertError) {
    if (insertError.code === "23505")
      return Response.json({ ok: true, duplicate: true });
    console.error("Webhook Asaas: gravar evento", insertError.message);
    return new Response("Erro", { status: 500 });
  }

  try {
    await syncSubscriptionEvent(admin, getPaymentProvider(), event);
  } catch (error) {
    // Libera o id para o Asaas tentar de novo.
    await admin.from("payment_events").delete().eq("id", event.id);
    console.error("Webhook Asaas: processar", event.event, error);
    return new Response("Erro", { status: 500 });
  }
  return Response.json({ ok: true });
}
