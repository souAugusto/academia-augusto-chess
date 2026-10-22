"use client";

import { useEffect, useState } from "react";

type Connection = { saveData?: boolean; effectiveType?: string };

// O vídeo só entra quando vale a pena: sem "reduzir movimento", sem economia
// de dados e sem conexão 2G. Nos outros casos fica só o poster.
function canPlayVideo(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  const connection = (navigator as Navigator & { connection?: Connection })
    .connection;
  if (connection?.saveData) return false;
  if (/(^|-)2g$/.test(connection?.effectiveType ?? "")) return false;
  return true;
}

// Fundo do hero: o poster aparece na hora; o vídeo é criado só depois que a
// página carregou (não atrasa o carregamento principal) e aparece suavemente
// quando começa a tocar. Decorativo: escondido de leitores de tela.
export function HeroVideo() {
  const [allowed, setAllowed] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const start = () => setAllowed(canPlayVideo());
    // Espera a página terminar de carregar para começar a baixar o vídeo.
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    const onMotion = () => setAllowed(canPlayVideo());
    motion.addEventListener("change", onMotion);
    return () => {
      window.removeEventListener("load", start);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-20">
      <picture>
        <source srcSet="/videos/hero-poster.webp" type="image/webp" />
        <img
          src="/videos/hero-poster.jpg"
          alt=""
          className="hero-media"
          decoding="async"
          // É o maior elemento visível da página inicial: baixa primeiro.
          fetchPriority="high"
        />
      </picture>
      {allowed && (
        <video
          className={`hero-media transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          onPlaying={() => setPlaying(true)}
          tabIndex={-1}
        >
          <source src="/videos/hero.webm" type="video/webm" />
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
