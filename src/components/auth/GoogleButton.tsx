import Link from "next/link";
import { signInWithGoogle } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function GoogleButton({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <SubmitButton variant="contorno" pendingText="Abrindo o Google...">
        Continuar com Google
      </SubmitButton>
      <p className="text-center text-[0.8125rem] leading-normal text-texto-discreto">
        Ao continuar com o Google, você aceita os{" "}
        <Link
          href="/termos"
          className="text-dourado underline underline-offset-4"
        >
          Termos de uso
        </Link>{" "}
        e a{" "}
        <Link
          href="/privacidade"
          className="text-dourado underline underline-offset-4"
        >
          Política de privacidade
        </Link>
        .
      </p>
    </form>
  );
}

export function OrDivider() {
  return (
    <div
      className="flex items-center gap-3 text-[0.8125rem] text-texto-discreto"
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-borda" />
      <span>ou</span>
      <span className="h-px flex-1 bg-borda" />
    </div>
  );
}
