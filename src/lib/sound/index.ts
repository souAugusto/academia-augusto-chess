// Motor de sons do site. Os componentes só chamam playSound(evento); nenhum
// toca áudio direto. Usa Web Audio com os sons já prontos em memória (baixa
// latência). Nada toca antes de o aluno tocar ou clicar na página: o contexto
// de áudio é criado e "destravado" na primeira interação.

import type { SoundPack } from "@/lib/preferences/schema";
import { SOUND_EVENTS, synthesize, type SoundEvent } from "./synth";

export type { SoundEvent } from "./synth";

type Settings = { enabled: boolean; volume: number; pack: SoundPack };

let settings: Settings = { enabled: true, volume: 50, pack: "suave" };
let context: AudioContext | null = null;
let output: GainNode | null = null;
let unlocked = false;
const buffers = new Map<string, AudioBuffer>();

const key = (pack: SoundPack, event: SoundEvent) => `${pack}:${event}`;

// Prepara os sons do pacote escolhido, em pedaços, sem travar a página.
function preload(pack: SoundPack) {
  const ctx = context;
  if (!ctx) return;
  const pending = SOUND_EVENTS.filter((e) => !buffers.has(key(pack, e)));
  const next = () => {
    const event = pending.shift();
    if (!event) return;
    const samples = synthesize(event, pack, ctx.sampleRate);
    const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
    buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
    buffers.set(key(pack, event), buffer);
    setTimeout(next, 0);
  };
  next();
}

function applyVolume() {
  // Curva quadrática: o meio do controle soa como "metade" do volume.
  if (output) output.gain.value = (settings.volume / 100) ** 2;
}

function unlock() {
  if (unlocked || typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;
  try {
    // Safari: "ambient" respeita a chave de silêncio do iPhone.
    const session = (
      navigator as unknown as { audioSession?: { type: string } }
    ).audioSession;
    if (session) session.type = "ambient";
    context = new AudioCtx();
    output = context.createGain();
    output.connect(context.destination);
    applyVolume();
    void context.resume();
    unlocked = true;
    preload(settings.pack);
  } catch {
    context = null;
  }
}

if (typeof window !== "undefined") {
  const events = ["pointerdown", "keydown", "touchend"] as const;
  const handler = () => {
    unlock();
    if (unlocked)
      for (const e of events) window.removeEventListener(e, handler);
  };
  for (const e of events)
    window.addEventListener(e, handler, { passive: true });
}

export function setSoundSettings(next: Settings) {
  const packChanged = next.pack !== settings.pack;
  settings = next;
  applyVolume();
  if (packChanged && unlocked) preload(next.pack);
}

export function playSound(event: SoundEvent) {
  if (!settings.enabled || settings.volume === 0) return;
  if (!unlocked || !context || !output) return;
  const buffer = buffers.get(key(settings.pack, event));
  if (!buffer) return;
  if (context.state === "suspended") void context.resume();
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(output);
  source.start();
}
