// Motor de sons do site. Os componentes só chamam playSound(evento); nenhum
// toca áudio direto. Usa Web Audio com os sons já prontos em memória (baixa
// latência). Nada toca antes de o aluno tocar ou clicar na página: o contexto
// de áudio é criado e "destravado" na primeira interação.
//
// No fim da cadeia há um compressor leve e um limite de vozes simultâneas, para
// lances rápidos não somarem volume nem distorcerem.

import type { Preferences, SoundPack } from "@/lib/preferences/schema";
import {
  audioPackOf,
  SOUND_EVENTS,
  SOUND_GROUP_OF,
  synthesize,
  VIBRATION_PATTERNS,
  type SoundEvent,
} from "./synth";

export type { SoundEvent } from "./synth";

type Settings = Preferences["sound"];

const MAX_VOICES = 6;
const PITCH_VARIATION = 0.03; // ±3% a cada som de lance

let settings: Settings = {
  enabled: true,
  volume: 50,
  pack: "suave",
  groups: { lances: true, feedback: true, interface: false },
  opponent: true,
};
let context: AudioContext | null = null;
let output: GainNode | null = null;
let unlocked = false;
const buffers = new Map<string, AudioBuffer>();
const voices: AudioBufferSourceNode[] = [];

const key = (pack: SoundPack, event: SoundEvent) =>
  `${audioPackOf(pack)}:${event}`;

function bufferFor(pack: SoundPack, event: SoundEvent): AudioBuffer | null {
  const ctx = context;
  if (!ctx) return null;
  const cached = buffers.get(key(pack, event));
  if (cached) return cached;
  const samples = synthesize(event, pack, ctx.sampleRate);
  const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
  buffer.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
  buffers.set(key(pack, event), buffer);
  return buffer;
}

// Prepara os sons do pacote escolhido, em pedaços, sem travar a página.
function preload(pack: SoundPack) {
  const pending = SOUND_EVENTS.filter((e) => !buffers.has(key(pack, e)));
  const next = () => {
    const event = pending.shift();
    if (!event) return;
    bufferFor(pack, event);
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
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    output.connect(compressor);
    compressor.connect(context.destination);
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

// O Chrome do computador tem navigator.vibrate, mas não vibra: exige também
// tela de toque (celular ou tablet).
export function vibrationSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function" &&
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

// Decide se o evento toca com estas preferências (lógica pura, testável).
export function shouldPlay(
  event: SoundEvent,
  current: Settings,
  options: { opponent?: boolean } = {},
): boolean {
  if (!current.enabled) return false;
  if (current.pack !== "vibracao" && current.volume === 0) return false;
  if (!current.groups[SOUND_GROUP_OF[event]]) return false;
  if (options.opponent && !current.opponent) return false;
  return true;
}

function start(pack: SoundPack, event: SoundEvent, at = 0) {
  if (!unlocked || !context || !output) return;
  const buffer = bufferFor(pack, event);
  if (!buffer) return;
  if (context.state === "suspended") void context.resume();
  // Limite de vozes: a mais antiga para quando chega a sétima.
  while (voices.length >= MAX_VOICES) {
    const oldest = voices.shift();
    try {
      oldest?.stop();
    } catch {
      // Já tinha terminado.
    }
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  if (SOUND_GROUP_OF[event] === "lances")
    source.playbackRate.value = 1 + (Math.random() * 2 - 1) * PITCH_VARIATION;
  source.connect(output);
  source.onended = () => {
    const index = voices.indexOf(source);
    if (index >= 0) voices.splice(index, 1);
  };
  voices.push(source);
  source.start(context.currentTime + at);
}

// Toca um evento com as preferências do aluno. `opponent`: o lance foi do
// adversário (respeita a opção "tocar o som do lance do adversário").
export function playSound(
  event: SoundEvent,
  options: { opponent?: boolean } = {},
) {
  if (!shouldPlay(event, settings, options)) return;
  if (settings.pack === "vibracao") {
    if (vibrationSupported()) navigator.vibrate(VIBRATION_PATTERNS[event]);
    return;
  }
  start(settings.pack, event);
}

// "Ouvir exemplo": lance, captura e xeque do pacote, mesmo que não seja o
// escolhido. Só funciona depois de uma interação (o próprio clique já conta).
export function playSample(pack: SoundPack) {
  unlock();
  if (pack === "vibracao") {
    if (vibrationSupported()) {
      navigator.vibrate([
        ...VIBRATION_PATTERNS.move,
        250,
        ...VIBRATION_PATTERNS.capture,
        250,
        ...VIBRATION_PATTERNS.check,
      ]);
    }
    return;
  }
  (["move", "capture", "check"] as const).forEach((event, i) =>
    start(pack, event, i * 0.42),
  );
}
