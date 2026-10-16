"use client";

// Cache local (IndexedDB) das análises, para reabrir uma partida na hora.
// É só conveniência: se o navegador não deixar (aba anônima, armazenamento
// bloqueado), tudo segue funcionando pelo servidor.
import type { StoredAnalysis } from "./compact";
import { ANALYSIS_PROFILE } from "./profile";

const DB = "finale-analises";
const STORE = "analises";

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// A chave inclui o perfil e a versão das regras: mudou o perfil, o cache antigo
// deixa de valer sozinho.
const keyOf = (gameKey: string) =>
  `${gameKey}|d${ANALYSIS_PROFILE.depth}|m${ANALYSIS_PROFILE.deepLines}|n${ANALYSIS_PROFILE.maxDeepPositions}`;

export async function readCachedAnalysis(
  gameKey: string,
): Promise<StoredAnalysis | null> {
  const db = await open();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const request = db
        .transaction(STORE, "readonly")
        .objectStore(STORE)
        .get(keyOf(gameKey));
      request.onsuccess = () => resolve((request.result as StoredAnalysis) ?? null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function writeCachedAnalysis(
  gameKey: string,
  data: StoredAnalysis,
): Promise<void> {
  const db = await open();
  if (!db) return;
  try {
    db.transaction(STORE, "readwrite").objectStore(STORE).put(data, keyOf(gameKey));
  } catch {
    // Sem espaço ou bloqueado: segue sem cache.
  }
}
