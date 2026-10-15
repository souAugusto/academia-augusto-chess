"use client";

import { useEffect, useRef, useState } from "react";
import { initials } from "@/lib/profile/nickname";

// Avatar do site inteiro (cabeçalho, Minha conta, ranking). Mostra a foto e,
// se não houver foto ou ela falhar ao carregar, as iniciais sobre o dourado
// da marca. Nunca mostra imagem quebrada.
export function Avatar({
  url,
  name,
  size = 64,
  decorative = false,
}: {
  url: string | null;
  name: string;
  size?: number;
  // Decorativo quando o nome já aparece ao lado (o leitor de tela não repete).
  decorative?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const img = useRef<HTMLImageElement>(null);
  // A foto pode falhar antes de a página ficar interativa (o onError não
  // dispara nesse caso): confere ao montar.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0 && url) setFailedUrl(url);
  }, [url]);
  const style = { width: size, height: size };
  const label = decorative ? undefined : `Foto de ${name}`;

  if (url && failedUrl !== url)
    return (
      // eslint-disable-next-line @next/next/no-img-element -- foto pequena, já otimizada no envio
      <img
        ref={img}
        src={url}
        alt={label ?? ""}
        width={size}
        height={size}
        style={style}
        onError={() => setFailedUrl(url)}
        referrerPolicy="no-referrer"
        className="shrink-0 rounded-full border border-border object-cover"
      />
    );
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      style={{ ...style, fontSize: Math.max(11, size * 0.38) }}
      className="flex shrink-0 items-center justify-center rounded-full bg-accent font-display font-semibold text-on-accent"
    >
      {initials(name)}
    </span>
  );
}
