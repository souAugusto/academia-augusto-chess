"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SITE_SETTINGS,
  parseSiteSettings,
  sameSettings,
  SITE_FLAGS,
  SITE_SETTINGS_POLL_MS,
  type SiteSettings,
} from "@/lib/site-settings";

type Value = { settings: SiteSettings; isAdmin: boolean };

const SiteSettingsContext = createContext<Value>({
  settings: DEFAULT_SITE_SETTINGS,
  isAdmin: false,
});

// Lê a resposta da API no mesmo formato do servidor (objeto chave -> booleano).
function fromApi(body: unknown): SiteSettings {
  if (!body || typeof body !== "object") return DEFAULT_SITE_SETTINGS;
  return parseSiteSettings(
    Object.keys(SITE_FLAGS).map((key) => ({
      key,
      enabled: (body as Record<string, unknown>)[key],
    })),
  );
}

// Interruptores do site no navegador. Começa com o valor do servidor e confere
// a cada minuto (só com a aba visível, e ao voltar para a aba). Se mudou,
// atualiza o menu e recarrega os dados da página (sem recarregar a página).
export function SiteSettingsProvider({
  initial,
  isAdmin,
  children,
}: {
  initial: SiteSettings;
  isAdmin: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  // Nova leitura do servidor (troca de página, router.refresh): vale ela.
  const [fromServer, setFromServer] = useState(initial);
  if (fromServer !== initial) {
    setFromServer(initial);
    setSettings(initial);
  }

  useEffect(() => {
    let current = initial;
    let busy = false;
    const check = async () => {
      if (busy || document.visibilityState !== "visible") return;
      busy = true;
      try {
        const response = await fetch("/api/configuracoes-site", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next = fromApi(await response.json());
        if (!sameSettings(current, next)) {
          current = next;
          setSettings(next);
          router.refresh();
        }
      } catch (error) {
        // Sem resposta: mantém o que já estava (o padrão é mostrar tudo).
        console.error(
          "Não foi possível conferir as configurações do site.",
          error,
        );
      } finally {
        busy = false;
      }
    };
    const timer = window.setInterval(check, SITE_SETTINGS_POLL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [initial, router]);

  return (
    <SiteSettingsContext.Provider value={{ settings, isAdmin }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

// Leitura única dos interruptores para qualquer componente do navegador.
export function useSiteSettings(): Value {
  return useContext(SiteSettingsContext);
}
