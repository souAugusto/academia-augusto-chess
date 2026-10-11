import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

// Notificações do Asaas. Os objetos aceitam campos extras: o Asaas avisa que
// pode incluir atributos novos a qualquer momento.

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const asaasEventSchema = z.looseObject({
  id: z.string().min(1).max(200),
  event: z.string().min(1).max(100),
  payment: z
    .looseObject({
      id: z.string(),
      subscription: z.string().nullish(),
      dueDate: date,
    })
    .optional(),
  subscription: z.looseObject({ id: z.string() }).optional(),
});

export type AsaasEvent = z.infer<typeof asaasEventSchema>;

export function parseAsaasEvent(rawBody: string): AsaasEvent | null {
  try {
    const parsed = asaasEventSchema.safeParse(JSON.parse(rawBody));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// O Asaas manda o token configurado no webhook no header asaas-access-token.
// Comparação em tempo constante (os hashes têm o mesmo tamanho).
export function tokenMatches(
  received: string | null,
  expected: string,
): boolean {
  if (!received || !expected) return false;
  const a = createHash("sha256").update(received).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

// Id da assinatura no Asaas a que o evento se refere.
export function subscriptionIdOf(event: AsaasEvent): string | null {
  return event.payment?.subscription ?? event.subscription?.id ?? null;
}
