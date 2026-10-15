"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { removeAvatar, uploadAvatar } from "@/app/(app)/conta/perfil/actions";
import { buttonClasses } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { AVATAR_MAX_BYTES } from "@/lib/validation/profile";
import { Avatar } from "./Avatar";

const VIEW = 240; // tamanho da área de recorte na tela (px)
const OUT = 512; // tamanho final enviado ao servidor (px)
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Draft = {
  image: HTMLImageElement;
  url: string;
  zoom: number;
  x: number; // deslocamento do centro, em px da área de recorte
  y: number;
};

// Escala que faz a imagem cobrir o quadrado inteiro.
const coverScale = (img: HTMLImageElement) =>
  Math.max(VIEW / img.naturalWidth, VIEW / img.naturalHeight);

// Mantém a imagem cobrindo o recorte (sem bordas vazias).
function clamp(draft: Draft, x: number, y: number) {
  const scale = coverScale(draft.image) * draft.zoom;
  const maxX = Math.max(0, (draft.image.naturalWidth * scale - VIEW) / 2);
  const maxY = Math.max(0, (draft.image.naturalHeight * scale - VIEW) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

function draw(canvas: HTMLCanvasElement, draft: Draft, size: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ratio = size / VIEW;
  const scale = coverScale(draft.image) * draft.zoom * ratio;
  const w = draft.image.naturalWidth * scale;
  const h = draft.image.naturalHeight * scale;
  ctx.clearRect(0, 0, size, size);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    draft.image,
    size / 2 - w / 2 + draft.x * ratio,
    size / 2 - h / 2 + draft.y * ratio,
    w,
    h,
  );
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(
      (blob) => {
        // Safari antigo não gera webp: cai para jpeg (o servidor converte).
        if (blob && blob.type === "image/webp") resolve(blob);
        else canvas.toBlob(resolve, "image/jpeg", 0.88);
      },
      "image/webp",
      0.85,
    ),
  );
}

// Foto do perfil: escolher, recortar (arrastar e aproximar), pré-visualizar e
// salvar; ou remover. O cabeçalho se atualiza sem recarregar a página.
export function AvatarEditor({
  url,
  name,
  hasUploaded,
}: {
  url: string | null;
  name: string;
  hasUploaded: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (draft && canvas.current) draw(canvas.current, draft, VIEW);
  }, [draft]);
  useEffect(
    () => () => {
      if (draft) URL.revokeObjectURL(draft.url);
    },
    [draft],
  );

  function pick(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setError("Use uma imagem JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError("A imagem pode ter no máximo 2 MB.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () =>
      setDraft({ image, url: objectUrl, zoom: 1, x: 0, y: 0 });
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError("Não consegui abrir essa imagem. Tente outra foto.");
    };
    image.src = objectUrl;
  }

  function move(dx: number, dy: number) {
    setDraft((d) => (d ? { ...d, ...clamp(d, d.x + dx, d.y + dy) } : d));
  }

  function save() {
    if (!draft) return;
    startTransition(async () => {
      const out = document.createElement("canvas");
      out.width = OUT;
      out.height = OUT;
      draw(out, draft, OUT);
      const blob = await toBlob(out);
      if (!blob) {
        setError("Não consegui preparar a foto. Tente outra imagem.");
        return;
      }
      const data = new FormData();
      data.append(
        "avatar",
        new File(
          [blob],
          blob.type === "image/webp" ? "foto.webp" : "foto.jpg",
          {
            type: blob.type,
          },
        ),
      );
      const result = await uploadAvatar(data);
      if (result.ok) {
        setDraft(null);
        toast("sucesso", result.message ?? "Foto atualizada.");
        router.refresh();
      } else {
        const message =
          result.errors?.avatar ?? result.message ?? "Não consegui salvar.";
        setError(message);
        toast("erro", message);
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeAvatar();
      toast(result.ok ? "sucesso" : "erro", result.message ?? "Foto removida.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {draft ? (
        <div className="flex flex-col items-start gap-4">
          <div
            className="relative cursor-grab touch-none overflow-hidden rounded-full border border-border-strong focus-visible:outline-2 focus-visible:outline-accent active:cursor-grabbing"
            style={{ width: VIEW, height: VIEW }}
            tabIndex={0}
            role="img"
            aria-label="Pré-visualização da foto. Arraste ou use as setas para ajustar."
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              move(
                event.clientX - drag.current.x,
                event.clientY - drag.current.y,
              );
              drag.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onKeyDown={(event) => {
              const step = 8;
              const keys: Record<string, [number, number]> = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
              };
              const delta = keys[event.key];
              if (delta) {
                event.preventDefault();
                move(...delta);
              }
            }}
          >
            <canvas ref={canvas} width={VIEW} height={VIEW} />
          </div>
          <div className="flex w-full max-w-[240px] flex-col gap-1.5">
            <label htmlFor="avatar-zoom" className="text-sm font-semibold">
              Aproximar
            </label>
            <input
              id="avatar-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={draft.zoom}
              onChange={(event) =>
                setDraft((d) => {
                  if (!d) return d;
                  const next = { ...d, zoom: Number(event.target.value) };
                  return { ...next, ...clamp(next, d.x, d.y) };
                })
              }
              className="accent-[var(--accent)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending}
              className={buttonClasses("primary")}
            >
              {pending ? "Salvando..." : "Salvar foto"}
            </button>
            <button
              type="button"
              onClick={() => setDraft(null)}
              disabled={pending}
              className={buttonClasses("ghost")}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <Avatar url={url} name={name} size={96} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={pending}
              className={buttonClasses("secondary")}
            >
              Alterar foto
            </button>
            {hasUploaded && (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className={buttonClasses("ghost")}
              >
                {pending ? "Removendo..." : "Remover foto"}
              </button>
            )}
          </div>
        </div>
      )}
      <input
        ref={input}
        id="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Escolher foto"
        aria-describedby="avatar-dica"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <p id="avatar-dica" className="text-[0.8125rem] text-muted">
        JPG, PNG ou WEBP de até 2 MB. A foto fica redonda e os dados escondidos
        da imagem (como localização) são apagados.
      </p>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
