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
// Marca uma mudança que ainda não chegou ao servidor (aba fechada antes de
// salvar, sem rede etc.). Enquanto existir, a versão local vale mais que a do
// servidor e é reenviada na próxima visita.
const PENDING_KEY = "finale:preferencias:pendente";

type Ctx = {
  prefs: Preferences;
  // false até saber as preferências do aluno (cache do aparelho ou servidor):
  // os tabuleiros esperam, para não aparecerem no tema errado e trocarem.
  ready: boolean;
  update: (change: (current: Preferences) => Preferences) => void;
  reset: () => void;
};

const PreferencesContext = createContext<Ctx>({
  prefs: DEFAULT_PREFERENCES,
  update: () => {},
  reset: () => {},
  ready: true,
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

function readPending(): string | null {
  try {
    return window.localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

function markPending(): string {
  const mark = String(Date.now());
  try {
    window.localStorage.setItem(PENDING_KEY, mark);
  } catch {
    // Sem armazenamento: o envio imediato continua valendo.
  }
  return mark;
}

function clearPending(mark: string | null) {
  try {
    // Só limpa se nada mais novo foi marcado enquanto o envio acontecia.
    if (window.localStorage.getItem(PENDING_KEY) === mark)
      window.localStorage.removeItem(PENDING_KEY);
  } catch {
    // Sem armazenamento: nada a limpar.
  }
}

// Envia ao servidor e só tira a marca de pendente se deu certo.
async function push(prefs: Preferences) {
  const mark = readPending();
  try {
    const result = await savePreferences(prefs);
    if (result.ok) clearPending(mark);
  } catch {
    // Sem rede: fica pendente para a próxima visita.
  }
}

// Guarda as preferências do aluno e aplica no site inteiro.
// - Visitante: localStorage.
// - Logado: profiles.preferences; o localStorage é só cache para não "piscar".
// - Primeiro login: se o servidor ainda não tem preferências, envia as locais.
//   Se tem, o servidor manda, exceto quando há mudança local pendente.
export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  // null = ainda conferindo com o servidor.
  const logged = useRef<boolean | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncing = useRef<Promise<void> | null>(null);

  const sync = useCallback(() => {
    // Uma sincronização por vez (o Supabase avisa "entrou" várias vezes).
    syncing.current ??= (async () => {
      try {
        const result = await getMyPreferences();
        logged.current = result.logged;
        if (!result.logged) return;
        // Lido depois da resposta: inclui o que o aluno mudou enquanto isso.
        const local = readLocal();
        if (local && readPending()) {
          await push(local);
        } else if (result.prefs) {
          setPrefs(result.prefs);
          writeLocal(result.prefs);
        } else if (local) {
          await push(local);
        }
      } catch {
        // Sem rede: fica com o cache local.
      } finally {
        syncing.current = null;
        setReady(true);
      }
    })();
    return syncing.current;
  }, []);

  useEffect(() => {
    const local = readLocal();
    // Aplica o cache local assim que a página abre, antes de falar com o servidor.
    if (local) {
      /* eslint-disable react-hooks/set-state-in-effect -- localStorage só existe no navegador */
      setPrefs(local);
      setReady(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    void sync();
    // Sem cache e sem resposta do servidor: não segura o tabuleiro para sempre.
    const fallback = setTimeout(() => setReady(true), 1500);
    const { data } = createClient().auth.onAuthStateChange((event) => {
      // Só quando a pessoa acaba de entrar (não a cada aviso de sessão).
      if (event === "SIGNED_IN" && !logged.current) void sync();
      if (event === "SIGNED_OUT") {
        logged.current = false;
        clearPending(readPending());
      }
    });
    return () => {
      clearTimeout(fallback);
      data.subscription.unsubscribe();
    };
  }, [sync]);

  useEffect(() => {
    setSoundSettings(prefs.sound);
  }, [prefs.sound]);

  const pendingSave = useRef<Preferences | null>(null);

  const persist = useCallback((next: Preferences) => {
    writeLocal(next);
    if (logged.current === false) return;
    markPending();
    // Ainda conferindo o login: a sincronização envia ao terminar.
    if (logged.current === null) return;
    pendingSave.current = next;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      pendingSave.current = null;
      void push(next);
    }, 400);
  }, []);

  // Saindo da página com envio agendado: tenta mandar na hora.
  useEffect(() => {
    const flush = () => {
      if (!pendingSave.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const next = pendingSave.current;
      pendingSave.current = null;
      void push(next);
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
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

  // "Restaurar padrão" volta a aparência (tabuleiro, peças e sons) ao padrão;
  // as opções de e-mail não são aparência e ficam como o aluno deixou.
  const reset = useCallback(() => {
    setPrefs((current) => {
      const next = { ...DEFAULT_PREFERENCES, emails: current.emails };
      persist(next);
      return next;
    });
  }, [persist]);

  return (
    <PreferencesContext.Provider value={{ prefs, update, reset, ready }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}

// Atalho para os tabuleiros.
export function useBoardPreferences() {
  const { prefs, ready } = useContext(PreferencesContext);
  return { board: prefs.board, pieces: prefs.pieces, ready };
}
