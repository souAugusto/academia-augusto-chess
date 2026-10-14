import type { SoundPack } from "@/lib/preferences/schema";

// Sons gerados por código (síntese), sem arquivos de terceiros: não há licença
// a cumprir e nada para baixar. Cada evento vira um trecho curto de áudio mono.

export const SOUND_EVENTS = [
  "move",
  "capture",
  "check",
  "castle",
  "promote",
  "correct",
  "wrong",
  "solved",
  "cycleEnd",
  "title",
] as const;
export type SoundEvent = (typeof SOUND_EVENTS)[number];

export const SOUND_EVENT_LABELS: Record<SoundEvent, string> = {
  move: "Movimento",
  capture: "Captura",
  check: "Xeque",
  castle: "Roque",
  promote: "Promoção",
  correct: "Lance correto",
  wrong: "Lance errado",
  solved: "Puzzle resolvido",
  cycleEnd: "Fim de ciclo",
  title: "Título conquistado",
};

type Voice = {
  at: number; // início, em segundos
  freq: number; // Hz (0 = ruído)
  dur: number; // segundos
  gain: number; // 0 a 1
  decay: number; // quanto maior, mais rápido some
  shape?: "sine" | "triangle" | "wood";
  slide?: number; // frequência final (glissando)
};

// Ruído determinístico (mesmo som sempre, e testável).
function noise(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 2147483648 - 1;
  };
}

function render(voices: Voice[], sampleRate: number): Float32Array {
  const length = Math.ceil(
    Math.max(...voices.map((v) => v.at + v.dur)) * sampleRate,
  );
  const out = new Float32Array(length);
  voices.forEach((voice, index) => {
    const start = Math.floor(voice.at * sampleRate);
    const count = Math.floor(voice.dur * sampleRate);
    const rand = noise(index + 7);
    let phase = 0;
    let low = 0;
    for (let i = 0; i < count && start + i < length; i++) {
      const t = i / sampleRate;
      const progress = i / count;
      const env =
        Math.min(1, i / (0.004 * sampleRate)) * Math.exp(-voice.decay * t);
      const freq = voice.slide
        ? voice.freq + (voice.slide - voice.freq) * progress
        : voice.freq;
      phase += (2 * Math.PI * freq) / sampleRate;
      let sample: number;
      if (voice.shape === "wood") {
        // Ruído filtrado + tom curto: batida de peça de madeira no tabuleiro.
        low += 0.25 * (rand() - low);
        sample = 0.7 * low + 0.5 * Math.sin(phase) * Math.exp(-60 * t);
      } else if (voice.shape === "triangle") {
        sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
      } else {
        sample = Math.sin(phase) + 0.2 * Math.sin(2 * phase);
      }
      out[start + i] += sample * env * voice.gain;
    }
  });
  // Normaliza para não estourar.
  const peak = out.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
  if (peak > 0.9) for (let i = 0; i < length; i++) out[i] *= 0.9 / peak;
  return out;
}

const note = (
  at: number,
  freq: number,
  dur = 0.18,
  gain = 0.5,
  shape: Voice["shape"] = "sine",
): Voice => ({ at, freq, dur, gain, decay: 14, shape });

function voicesFor(event: SoundEvent, pack: SoundPack): Voice[] {
  const wood = pack === "madeira";
  const tap = (at: number, freq: number, gain = 0.8): Voice =>
    wood
      ? { at, freq, dur: 0.09, gain, decay: 45, shape: "wood" }
      : { at, freq, dur: 0.08, gain: gain * 0.6, decay: 40 };
  switch (event) {
    case "move":
      return [tap(0, wood ? 900 : 520)];
    case "capture":
      return [tap(0, wood ? 600 : 360, 1), tap(0.035, wood ? 450 : 300, 0.7)];
    case "check":
      return [note(0, 740, 0.12, 0.45), note(0.09, 988, 0.16, 0.45)];
    case "castle":
      return [tap(0, wood ? 900 : 520), tap(0.09, wood ? 820 : 480)];
    case "promote":
      return [
        tap(0, wood ? 900 : 520),
        note(0.05, 784, 0.14, 0.35),
        note(0.12, 1047, 0.2, 0.35),
      ];
    case "correct":
      return [
        note(0, 659, 0.16, 0.4, wood ? "triangle" : "sine"),
        note(0.08, 831, 0.22, 0.4, wood ? "triangle" : "sine"),
      ];
    case "wrong":
      return [
        {
          at: 0,
          freq: 330,
          slide: 220,
          dur: 0.28,
          gain: 0.45,
          decay: 8,
          shape: "triangle",
        },
      ];
    case "solved":
      return [523, 659, 784].map((f, i) =>
        note(i * 0.08, f, 0.3, 0.38, wood ? "triangle" : "sine"),
      );
    case "cycleEnd":
      return [523, 659, 784, 1047].map((f, i) =>
        note(i * 0.1, f, 0.45, 0.36, wood ? "triangle" : "sine"),
      );
    case "title":
      return [
        ...[392, 523, 659, 784].map((f, i) => note(i * 0.11, f, 0.3, 0.35)),
        { ...note(0.46, 1047, 0.9, 0.42), decay: 4 },
        { ...note(0.46, 784, 0.9, 0.3), decay: 4 },
        { ...note(0.46, 523, 0.9, 0.25, "triangle"), decay: 4 },
      ];
  }
}

export function synthesize(
  event: SoundEvent,
  pack: SoundPack,
  sampleRate: number,
): Float32Array {
  return render(voicesFor(event, pack), sampleRate);
}

// Qual som tocar para um lance (dados no formato do chess.js).
export function soundForMove(move: { san: string; flags: string }): SoundEvent {
  if (/[+#]/.test(move.san)) return "check";
  if (move.flags.includes("p")) return "promote";
  if (move.flags.includes("k") || move.flags.includes("q")) return "castle";
  if (move.flags.includes("c") || move.flags.includes("e")) return "capture";
  return "move";
}
