"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { useReducedMotion } from "@/components/chess/useReducedMotion";
import { playSound } from "@/lib/sound";
import type { Title } from "@/lib/titles";

// Chuva de confete dourado num canvas leve (sem biblioteca). Para sozinha.
function Confetti({ titleColor }: { titleColor: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      el.width = window.innerWidth * dpr;
      el.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    // Dourado do tema + a cor do título.
    const accent =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim() || titleColor;
    const colors = [accent, titleColor, accent, "#ffffff"];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * el.width,
      y: -Math.random() * el.height,
      w: (6 + Math.random() * 6) * dpr,
      h: (3 + Math.random() * 4) * dpr,
      vy: (1.5 + Math.random() * 2.5) * dpr,
      vx: (Math.random() - 0.5) * 1.2 * dpr,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const started = performance.now();
    let frame = 0;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, el.width, el.height);
      const fading = time - started > 4500;
      let alive = 0;
      for (const p of pieces) {
        p.y += p.vy;
        p.x += p.vx + Math.sin(time / 600 + p.angle) * 0.4 * dpr;
        p.angle += p.spin;
        if (p.y > el.height && !fading) p.y = -20 * dpr;
        if (p.y <= el.height) alive++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [titleColor]);
  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}

// Tela cheia quando o aluno conquista um título. Mostra o mais alto da leva.
export function TitleCelebration({
  title,
  nickname,
  onClose,
}: {
  title: Title;
  nickname: string | null;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const continueButton = useRef<HTMLButtonElement>(null);
  const [shareNote, setShareNote] = useState<string | null>(null);

  useEffect(() => {
    playSound("title");
    continueButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function share() {
    if (!nickname) {
      setShareNote("Escolha um apelido em Conta → Perfil para compartilhar.");
      return;
    }
    const url = `${window.location.origin}/api/titulo/${encodeURIComponent(nickname)}/og`;
    const text = `Conquistei o título ${title.name} na Academia Finale de Xadrez!`;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "titulo-finale.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
    } catch {
      // Sem suporte a compartilhar arquivo: abre a imagem.
    }
    window.open(url, "_blank", "noopener");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-conquistado"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6"
    >
      {!reducedMotion && <Confetti titleColor={title.color} />}
      <div
        className={`relative flex max-w-md flex-col items-center gap-5 text-center ${reducedMotion ? "" : "title-pop"}`}
      >
        <span className="text-sm font-semibold tracking-label text-accent-text uppercase">
          Novo título
        </span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`size-32 drop-shadow-[0_0_30px_var(--accent)] ${reducedMotion ? "" : "title-shine"}`}
          style={{ color: title.color }}
          fill="currentColor"
        >
          <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm0 5 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5L12 7Z" />
        </svg>
        <h2
          id="titulo-conquistado"
          className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          {title.name}
        </h2>
        {title.tagline && (
          <p className="text-lg text-white/80">{title.tagline}</p>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            ref={continueButton}
            type="button"
            onClick={onClose}
            className={buttonClasses("primary", "lg")}
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={share}
            className={buttonClasses("secondary", "lg")}
          >
            Compartilhar
          </button>
        </div>
        {shareNote && <p className="text-sm text-white/80">{shareNote}</p>}
      </div>
    </div>
  );
}
