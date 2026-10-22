"use client";

import { useEffect, useState } from "react";
import { InstallSheet } from "./InstallSheet";
import { useInstall } from "./useInstall";

const DELAY_MS = 1800; // depois do carregamento inicial

// Convite automático para instalar o app. Usado só nas páginas de entrada
// (página inicial e login), nunca no meio de um treino. Aparece no celular,
// se o app ainda não está instalado, o navegador sabe instalar e o aluno não
// tocou em "Agora não" nos últimos 7 dias.
export function InstallPrompt() {
  const install = useInstall();
  // Momento em que o atraso terminou (também serve de "agora" para a regra dos 7 dias).
  const [readyAt, setReadyAt] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReadyAt(Date.now()), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const offer = readyAt !== null && !closed && install.shouldOffer(readyAt);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- abre quando as condições do navegador ficam prontas
    if (offer) setOpen(true);
  }, [offer]);

  if (!open || closed) return null;
  return (
    <InstallSheet
      platform={install.platform}
      onInstall={async () => {
        await install.promptInstall();
        setClosed(true);
      }}
      onClose={() => {
        install.dismiss();
        setClosed(true);
      }}
    />
  );
}
