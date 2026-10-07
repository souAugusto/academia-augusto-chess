"use client";

import { useEffect } from "react";

// Registra o service worker (public/sw.js) só em produção, para não atrapalhar
// o recarregamento automático do `npm run dev`.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Sem service worker o site funciona normalmente, só sem modo offline.
      });
  }, []);
  return null;
}
