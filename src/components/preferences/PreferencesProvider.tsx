"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getMyPreferences,
  savePreferences,
} from "@/app/(app)/conta/aparencia/actions";
import {
  DEFAULT_PREFERENCES,
  parsePreferences,
  type Preferences,
} from "@/lib/preferences/schema";
import { setSoundSettings } from "@/lib/sound";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "finale:preferencias";

type Ctx = {
  prefs: Preferences;
  update: (change: (current: Preferences) => Preferences) => void;
  reset: () => void;
};

const PreferencesContext = createContext<Ctx>({
  prefs: DEFAULT_PREFERENCES,
  update: () => {},
  reset: () => {},
});

function readLocal(): Preferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? parsePreferences(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function writeLocal(prefs: Preferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Navegador sem armazenamento (aba anônima etc.): segue só na memória.
  }
}

// Guarda as preferências do aluno e aplica no site inteiro.
// - Visitante: localStorage.
// - Logado: profiles.preferences; o localStorage é só cache para não "piscar".
// - Primeiro login: se o servidor ainda não tem preferências, envia as locais.
//   Se tem, o servidor manda.
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const logged = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sync = useCallback(async () => {
    const local = readLocal();
    try {
      const result = await getMyPreferences();
      logged.current = result.logged;
      if (!result.logged) return;
      if (result.prefs) {
        setPrefs(result.prefs);
        writeLocal(result.prefs);
      } else if (local) {
        await savePreferences(local);
      }
    } catch {
      // Sem rede: fica com o cache local.
    }
  }, []);

  useEffect(() => {
    const local = readLocal();
    // Aplica o cache local assim que a página abre, antes de falar com o servidor.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage só existe no navegador
    if (local) setPrefs(local);
    void sync();
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") void sync();
      if (event === "SIGNED_OUT") logged.current = false;
    });
    return () => data.subscription.unsubscribe();
  }, [sync]);

  useEffect(() => {
    setSoundSettings(prefs.sound);
  }, [prefs.sound]);

  const persist = useCallback((next: Preferences) => {
    writeLocal(next);
    if (!logged.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void savePreferences(next), 600);
  }, []);

  const update = useCallback(
    (change: (current: Preferences) => Preferences) => {
      setPrefs((current) => {
        const next = parsePreferences(change(current));
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const reset = useCallback(() => {
    setPrefs(DEFAULT_PREFERENCES);
    persist(DEFAULT_PREFERENCES);
  }, [persist]);

  return (
    <PreferencesContext.Provider value={{ prefs, update, reset }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

// Atalho para os tabuleiros.
export function useBoardPreferences() {
  const { prefs } = useContext(PreferencesContext);
  return { board: prefs.board, pieces: prefs.pieces };
}
