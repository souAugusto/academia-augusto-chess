"use client";

import { useState } from "react";
import { InstallSheet } from "./InstallSheet";
import { useInstall } from "./useInstall";

// "Instalar app" discreto (rodapé), para quem fechou o convite e quis
// instalar depois. Só aparece onde o navegador sabe instalar.
export function InstallButton({ className = "" }: { className?: string }) {
  const install = useInstall();
  const [open, setOpen] = useState(false);
  if (!install.canInstall) return null;
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (install.platform === "android") await install.promptInstall();
          else setOpen(true);
        }}
        className={`min-h-touch text-sm text-muted underline-offset-4 hover:text-text hover:underline ${className}`}
      >
        Instalar app
      </button>
      {open && (
        <InstallSheet
          platform={install.platform}
          onInstall={async () => {
            await install.promptInstall();
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
