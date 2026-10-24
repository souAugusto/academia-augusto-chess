"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setSiteFlag } from "@/app/admin/configuracoes/actions";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { SITE_FLAGS, type SiteFlag } from "@/lib/site-settings";

// Interruptor de uma área do site no admin. Desligar pede confirmação, porque
// a área some para todos os alunos na hora.
export function SiteFlagSwitch({
  flag,
  enabled,
  changed,
}: {
  flag: SiteFlag;
  enabled: boolean;
  changed: string | null; // "Alterado em ... por ..."
}) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const config = SITE_FLAGS[flag];

  function save(next: boolean) {
    setConfirming(false);
    startTransition(async () => {
      const result = await setSiteFlag({ key: flag, enabled: next });
      toast(result.ok ? "sucesso" : "erro", result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span id={`flag-${flag}`} className="font-semibold">
            {config.label}
          </span>
          <span className="text-sm text-muted">
            {enabled
              ? "Visível para os alunos."
              : "Oculta para os alunos (admins continuam vendo)."}
          </span>
          {changed && <span className="text-xs text-muted">{changed}</span>}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby={`flag-${flag}`}
          disabled={pending}
          onClick={() => (enabled ? setConfirming(true) : save(true))}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition disabled:opacity-60 ${
            enabled
              ? "border-accent bg-accent"
              : "border-border-strong bg-surface-2"
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block size-5 rounded-full bg-text shadow transition-transform motion-reduce:transition-none ${
              enabled ? "translate-x-6 bg-on-accent" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {confirming && (
        <div
          role="alertdialog"
          aria-labelledby={`flag-${flag}-confirma`}
          className="flex flex-col gap-3 rounded-control border border-danger/60 bg-surface-2 p-4"
        >
          <p id={`flag-${flag}-confirma`} className="text-sm leading-relaxed">
            {config.offWarning}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save(false)}
              className={buttonClasses("primary")}
            >
              Ocultar para todos
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className={buttonClasses("ghost")}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
