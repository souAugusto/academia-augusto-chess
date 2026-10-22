"use client";

import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/button";

// Registra o service worker (/sw.js) só em produção e em HTTPS (ou localhost),
// para não atrapalhar o recarregamento automático do `npm run dev`.
// Quando sai uma versão nova do site, mostra um aviso discreto com "Atualizar"
// em vez de recarregar sozinho (o aluno pode estar no meio de um treino).
export function ServiceWorkerRegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator) ||
      !window.isSecureContext
    )
      return;
    let registration: ServiceWorkerRegistration | null = null;
    // Só oferece atualizar se já havia uma versão controlando a página (na
    // primeira visita a versão nova entra sem aviso).
    const offer = (worker: ServiceWorker | null) => {
      if (worker && navigator.serviceWorker.controller) setWaiting(worker);
    };
    const check = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
        offer(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed") offer(installing);
          });
        });
      })
      .catch(() => {
        // Sem service worker o site funciona normalmente, só sem modo offline.
      });
    // Confere se há versão nova ao voltar para a aba.
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);

  function update() {
    if (!waiting) return;
    // Recarrega uma vez, quando a versão nova assumir.
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => window.location.reload(),
      { once: true },
    );
    waiting.postMessage("atualizar");
    setWaiting(null);
  }

  if (!waiting) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(var(--spacing-bottom-nav)+env(safe-area-inset-bottom)+0.75rem)] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3 shadow-card md:bottom-6"
    >
      <p className="text-[0.9375rem]">Nova versão disponível.</p>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => setWaiting(null)}
          className={buttonClasses("ghost", "md", "px-3")}
        >
          Depois
        </button>
        <button
          type="button"
          onClick={update}
          className={buttonClasses("primary", "md", "px-4")}
        >
          Atualizar
        </button>
      </div>
    </div>
  );
}
