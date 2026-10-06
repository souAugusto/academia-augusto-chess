"use client";

import { useFormStatus } from "react-dom";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingText: string;
  variant?: ButtonVariant;
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primario",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClasses(variant, "lg", "min-h-[3.25rem] w-full")}
    >
      {pending ? pendingText : children}
    </button>
  );
}
