import type { SoundPack } from "@/lib/preferences/schema";

// Sons gerados por código (síntese), sem arquivos de terceiros: os sons são da
// própria Finale, não há licença a cumprir e nada para baixar. Cada evento vira
// um trecho curto de áudio mono, montado com osciladores, ruído filtrado e
// envelopes. O ruído é determinístico (mesmo som sempre, e testável); a
// pequena variação de tom de cada lance é aplicada na hora de tocar.

export const SOUND_EVENTS = [
  "move",
  "capture",
  "check",
  "castle",
  "promote",
  "mate",
  "gameEnd",
  "correct",
  "wrong",
  "hint",
  "solved",
  "cycleEnd",
  "title",
  "brilliant",
  "notification",
  "ui",
] as const;
export type SoundEvent = (typeof SOUND_EVENTS)[number];

export const SOUND_EVENT_LABELS: Record<SoundEvent, string> = {
  move: "Movimento",
  capture: "Captura",
  check: "Xeque",
  castle: "Roque",
  promote: "Promoção",
  mate: "Xeque-mate",
  gameEnd: "Fim de partida",
  correct: "Lance correto",
  wrong: "Lance errado",
  hint: "Dica",
  solved: "Puzzle resolvido",
  cycleEnd: "Fim de ciclo",
  title: "Título conquistado",
  brilliant: "Lance brilhante",
  notification: "Nova notificação",
  ui: "Clique de interface",
};

// Grupos que o aluno liga e desliga separadamente.
export type SoundGroup = "lances" | "feedback" | "interface";
export const SOUND_GROUP_OF: Record<SoundEvent, SoundGroup> = {
  move: "lances",
  capture: "lances",
  check: "lances",
  castle: "lances",
  promote: "lances",
  mate: "lances",
  gameEnd: "lances",
  correct: "feedback",
  wrong: "feedback",
  hint: "feedback",
  solved: "feedback",
  cycleEnd: "feedback",
  title: "feedback",
  brilliant: "feedback",
  notification: "feedback",
  ui: "interface",
};

type Wave = "sine" | "soft" | "triangle" | "square" | "saw";

type Tone = {
  kind: "tone";
  at: number; // início, em segundos
  dur: number; // segundos
  freq: number; // Hz
  to?: number; // frequência final (glissando)
  glide?: "lin" | "exp"; // forma do glissando
  gain: number; // 0 a 1
  decay: number; // quanto maior, mais rápido some
  attack?: number; // segundos
  wave?: Wave;
  vibrato?: { rate: number; depth: number }; // Hz e fração da frequência
};

type Noise = {
  kind: "noise";
  at: number;
  dur: number;
  gain: number;
  decay: number;
  attack?: number;
  filter: "bandpass" | "lowpass" | "highpass" | "onepole";
  freq: number;
  to?: number;
  q?: number;
};

type Voice = Tone | Noise;

// Ruído determinístico.
function noise(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 2147483648 - 1;
  };
}

// Filtro biquad (receitas de Robert Bristow-Johnson), um por voz de ruído.
function biquad(type: "bandpass" | "lowpass" | "highpass", sampleRate: number) {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  return (x: number, freq: number, q: number) => {
    const w = (2 * Math.PI * Math.min(freq, sampleRate * 0.45)) / sampleRate;
    const alpha = Math.sin(w) / (2 * q);
    const cos = Math.cos(w);
    let b0: number;
    let b1: number;
    let b2: number;
    if (type === "bandpass") {
      b0 = alpha;
      b1 = 0;
      b2 = -alpha;
    } else if (type === "lowpass") {
      b0 = (1 - cos) / 2;
      b1 = 1 - cos;
      b2 = (1 - cos) / 2;
    } else {
      b0 = (1 + cos) / 2;
      b1 = -(1 + cos);
      b2 = (1 + cos) / 2;
    }
    const a0 = 1 + alpha;
    const a1 = -2 * cos;
    const a2 = 1 - alpha;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    return y;
  };
}

function waveSample(wave: Wave, phase: number): number {
  switch (wave) {
    case "sine":
      return Math.sin(phase);
    case "soft":
      return Math.sin(phase) + 0.2 * Math.sin(2 * phase);
    case "triangle":
      return (2 / Math.PI) * Math.asin(Math.sin(phase));
    case "square": {
      // Quadrada com poucos harmônicos (soa "8 bits" sem chiar).
      let s = 0;
      for (let k = 1; k <= 9; k += 2) s += Math.sin(k * phase) / k;
      return s * 0.9;
    }
    case "saw": {
      let s = 0;
      for (let k = 1; k <= 8; k++) s += Math.sin(k * phase) / k;
      return s * 0.6;
    }
  }
}

function glide(voice: { freq: number; to?: number; glide?: "lin" | "exp" }, p: number) {
  if (voice.to === undefined) return voice.freq;
  return voice.glide === "exp"
    ? voice.freq * (voice.to / voice.freq) ** p
    : voice.freq + (voice.to - voice.freq) * p;
}

function render(voices: Voice[], sampleRate: number, peakLimit = 0.9): Float32Array {
  const length = Math.ceil(
    Math.max(...voices.map((v) => v.at + v.dur)) * sampleRate,
  );
  const out = new Float32Array(length);
  voices.forEach((voice, index) => {
    const start = Math.floor(voice.at * sampleRate);
    const count = Math.floor(voice.dur * sampleRate);
    const attack = Math.max(1, (voice.attack ?? 0.004) * sampleRate);
    const rand = noise(index + 7);
    const filter = voice.kind === "noise" && voice.filter !== "onepole"
      ? biquad(voice.filter, sampleRate)
      : null;
    let phase = 0;
    let low = 0;
    for (let i = 0; i < count && start + i < length; i++) {
      const t = i / sampleRate;
      const progress = i / count;
      const env = Math.min(1, i / attack) * Math.exp(-voice.decay * t);
      let sample: number;
      if (voice.kind === "tone") {
        let freq = glide(voice, progress);
        if (voice.vibrato)
          freq *= 1 + voice.vibrato.depth * Math.sin(2 * Math.PI * voice.vibrato.rate * t);
        phase += (2 * Math.PI * freq) / sampleRate;
        sample = waveSample(voice.wave ?? "sine", phase);
      } else if (voice.filter === "onepole") {
        low += 0.25 * (rand() - low);
        sample = 0.7 * low;
      } else {
        sample = filter!(rand(), glide(voice, progress), voice.q ?? 1);
        // O passa-banda estreito perde energia: compensa pelo Q.
        if (voice.filter === "bandpass") sample *= Math.min(4, voice.q ?? 1);
      }
      out[start + i] += sample * env * voice.gain;
    }
  });
  // Normaliza para não estourar.
  const peak = out.reduce((max, v) => Math.max(max, Math.abs(v)), 0);
  if (peak > peakLimit) for (let i = 0; i < length; i++) out[i] *= peakLimit / peak;
  return out;
}

// ------------------------------------------------------------ peças de som
const tone = (
  at: number,
  freq: number,
  dur: number,
  gain: number,
  decay: number,
  extra: Partial<Tone> = {},
): Tone => ({ kind: "tone", at, freq, dur, gain, decay, ...extra });

const note = (at: number, freq: number, dur = 0.18, gain = 0.5, wave: Wave = "soft") =>
  tone(at, freq, dur, gain, 14, { wave });

// Batida de peça no tabuleiro: estalo de ruído num passa-banda + corpo grave
// que cai de tom. `band` decide o "material" (grave = oco, agudo = madeira).
function knock(
  at: number,
  opts: {
    band: number;
    q: number;
    body: number;
    drop: number;
    decay: number;
    gain: number;
    click?: number; // estalo agudo do ataque
    noise?: number; // quanto do estalo filtrado entra (o "material")
  },
): Voice[] {
  return [
    {
      kind: "noise",
      at,
      dur: 0.05 + 3 / opts.decay,
      gain: opts.gain * (opts.noise ?? 0.9),
      decay: opts.decay * 1.6,
      attack: 0.001,
      filter: "bandpass",
      freq: opts.band,
      q: opts.q,
    },
    tone(at, opts.body, 0.04 + 4 / opts.decay, opts.gain, opts.decay, {
      to: opts.body * opts.drop,
      glide: "exp",
      attack: 0.002,
    }),
    // Estalo de ataque bem curto (o "t" do "toc").
    {
      kind: "noise",
      at,
      dur: 0.012,
      gain: opts.gain * (opts.click ?? 0.35),
      decay: 300,
      attack: 0.0005,
      filter: "highpass",
      freq: 2500,
      q: 0.7,
    },
  ];
}

// Marimba simples (fundamental + harmônico 4, que some rápido).
const marimba = (at: number, freq: number, gain = 0.45, dur = 0.35): Voice[] => [
  tone(at, freq, dur, gain, 9, { attack: 0.002 }),
  tone(at, freq * 4, 0.08, gain * 0.35, 45, { attack: 0.001 }),
];

const chord = (at: number, freqs: number[], step: number, fn: (at: number, f: number) => Voice[]) =>
  freqs.flatMap((f, i) => fn(at + i * step, f));

// ---------------------------------------------------------------- pacotes
// Suave: o som de sempre (padrão). Os timbres antigos foram mantidos.
function suave(event: SoundEvent): Voice[] {
  const tap = (at: number, freq: number, gain = 0.8) =>
    tone(at, freq, 0.08, gain * 0.6, 40, { wave: "soft" });
  switch (event) {
    case "move":
      return [tap(0, 520)];
    case "capture":
      return [tap(0, 360, 1), tap(0.035, 300, 0.7)];
    case "check":
      return [note(0, 740, 0.12, 0.45), note(0.09, 988, 0.16, 0.45)];
    case "castle":
      return [tap(0, 520), tap(0.09, 480)];
    case "promote":
      return [tap(0, 520), note(0.05, 784, 0.14, 0.35), note(0.12, 1047, 0.2, 0.35)];
    case "mate":
      return [tap(0, 360, 1), note(0.06, 659, 0.2, 0.4), note(0.16, 523, 0.35, 0.4)];
    case "gameEnd":
      return [tap(0, 420), note(0.06, 523, 0.3, 0.35), note(0.16, 523, 0.35, 0.3)];
    case "hint":
      return [note(0, 880, 0.2, 0.28)];
    case "correct":
      return [note(0, 659, 0.16, 0.4), note(0.08, 831, 0.22, 0.4)];
    case "wrong":
      return [tone(0, 330, 0.28, 0.45, 8, { to: 220, wave: "triangle" })];
    case "solved":
      return [523, 659, 784].map((f, i) => note(i * 0.08, f, 0.3, 0.38));
    case "cycleEnd":
      return [523, 659, 784, 1047].map((f, i) => note(i * 0.1, f, 0.45, 0.36));
    case "title":
      return [
        ...[392, 523, 659, 784].map((f, i) => note(i * 0.11, f, 0.3, 0.35)),
        { ...note(0.46, 1047, 0.9, 0.42), decay: 4 },
        { ...note(0.46, 784, 0.9, 0.3), decay: 4 },
        { ...note(0.46, 523, 0.9, 0.25, "triangle"), decay: 4 },
      ];
    case "brilliant":
      return [784, 988, 1319].map((f, i) => note(i * 0.06, f, 0.4, 0.32, "sine"));
    case "notification":
      return [note(0, 880, 0.12, 0.22, "sine"), note(0.1, 1175, 0.2, 0.2, "sine")];
    case "ui":
      return [tone(0, 1200, 0.03, 0.18, 120, { wave: "sine" })];
  }
}

// Madeira: peça de madeira batendo num tabuleiro de madeira, com corpo.
function madeira(event: SoundEvent): Voice[] {
  // Peça de madeira maciça num tabuleiro de madeira: estalo seco em ~800 Hz,
  // corpo de ~175 Hz que cai de tom e uma camada bem grave (~90 Hz) que dá
  // peso. Decaimento curto (seco), sem estalos agudos.
  const k = (at: number, gain = 0.95, low = 1): Voice[] => [
    ...knock(at, {
      band: 800 * low,
      q: 1.6,
      body: 175 * low,
      drop: 0.55,
      decay: 30,
      gain,
      click: 0.12,
      noise: 0.55,
    }),
    tone(at, 92 * low, 0.12, gain * 0.55, 34, {
      to: 70 * low,
      glide: "exp",
      attack: 0.002,
    }),
  ];
  // Bloco de madeira afinado, uma oitava abaixo do antigo (mais encorpado).
  const block = (at: number, freq: number, gain = 0.4, dur = 0.3): Voice[] => [
    ...marimba(at, freq, gain, dur),
    tone(at, freq / 2, dur * 0.6, gain * 0.35, 14, { attack: 0.002 }),
  ];
  switch (event) {
    case "move":
      return k(0);
    case "capture":
      return [...k(0, 1, 0.85), ...k(0.035, 0.8, 0.72)];
    case "check":
      return [...k(0), ...block(0.06, 392, 0.38, 0.22), ...block(0.14, 523, 0.38, 0.28)];
    case "castle":
      return [...k(0), ...k(0.1, 0.85, 0.9)];
    case "promote":
      return [...k(0), ...chord(0.07, [392, 523, 659], 0.07, (t, f) => block(t, f, 0.32))];
    case "mate":
      return [
        ...k(0, 1, 0.75),
        ...k(0.05, 0.85, 0.68),
        ...chord(0.13, [196, 247, 294], 0.09, (t, f) => block(t, f, 0.36, 0.55)),
      ];
    case "gameEnd":
      return [...k(0, 0.85, 0.8), ...chord(0.1, [262, 330, 392], 0.09, (t, f) => block(t, f, 0.3, 0.5))];
    case "correct":
      return [...block(0, 392), ...block(0.08, 523)];
    case "wrong":
      return [...block(0, 294, 0.32, 0.25), ...block(0.12, 247, 0.28, 0.35)];
    case "hint":
      return block(0, 523, 0.26, 0.3);
    case "solved":
      return chord(0, [392, 494, 587], 0.08, (t, f) => block(t, f, 0.36));
    case "cycleEnd":
      return chord(0, [392, 494, 587, 784], 0.1, (t, f) => block(t, f, 0.34, 0.5));
    case "title":
      return [
        ...chord(0, [294, 392, 494, 587], 0.11, (t, f) => block(t, f, 0.32)),
        ...chord(0.46, [392, 587, 784], 0, (t, f) => block(t, f, 0.28, 0.9)),
      ];
    case "brilliant":
      return chord(0, [523, 659, 784, 1047], 0.055, (t, f) => block(t, f, 0.26, 0.45));
    case "notification":
      return [...block(0, 523, 0.22, 0.2), ...block(0.1, 659, 0.2, 0.3)];
    case "ui":
      return knock(0, { band: 1100, q: 2, body: 320, drop: 0.7, decay: 80, gain: 0.25, click: 0.05 });
  }
}

// Oco: "toc" grave e redondo, bem presente (como bater numa caixa oca).
function oco(event: SoundEvent): Voice[] {
  const k = (at: number, gain = 1, low = 1) =>
    knock(at, {
      band: 480 * low,
      q: 4,
      body: 165 * low,
      drop: 0.6,
      decay: 24,
      gain,
      click: 0.06,
      noise: 0.4,
    });
  // Bloco oco afinado (para os sons de feedback).
  const block = (at: number, freq: number, gain = 0.45, dur = 0.3): Voice[] => [
    tone(at, freq, dur, gain, 12, { wave: "triangle", attack: 0.002 }),
    tone(at, freq * 2.01, 0.12, gain * 0.3, 30, { attack: 0.001 }),
  ];
  switch (event) {
    case "move":
      return k(0);
    case "capture":
      return [...k(0, 1, 0.78), ...k(0.04, 0.55, 1.1)];
    case "check":
      return [...k(0), ...block(0.06, 523), ...block(0.14, 659)];
    case "castle":
      return [...k(0), ...k(0.11, 0.85, 0.9)];
    case "promote":
      return [...k(0), ...chord(0.07, [523, 659, 784], 0.07, (a, f) => block(a, f, 0.38))];
    case "mate":
      return [...k(0, 1, 0.7), ...k(0.06, 0.8, 0.7), ...chord(0.14, [392, 494, 587], 0.1, (a, f) => block(a, f, 0.4, 0.5))];
    case "correct":
      return [...block(0, 523), ...block(0.08, 784)];
    case "wrong":
      return [...block(0, 330, 0.4), ...block(0.13, 277, 0.35, 0.35)];
    case "hint":
      return block(0, 659, 0.3);
    case "gameEnd":
      return [...k(0, 0.85), ...chord(0.1, [330, 392, 494], 0.09, (a, f) => block(a, f, 0.32, 0.5))];
    case "solved":
      return chord(0, [392, 523, 659], 0.08, (a, f) => block(a, f, 0.42));
    case "cycleEnd":
      return chord(0, [392, 523, 659, 784], 0.1, (a, f) => block(a, f, 0.4, 0.5));
    case "title":
      return [
        ...chord(0, [330, 392, 523, 659], 0.11, (a, f) => block(a, f, 0.38)),
        ...chord(0.46, [392, 523, 784], 0, (a, f) => block(a, f, 0.34, 0.9)),
      ];
    case "brilliant":
      return chord(0, [523, 659, 784, 1047], 0.055, (a, f) => block(a, f, 0.32, 0.4));
    case "notification":
      return [...block(0, 523, 0.25, 0.2), ...block(0.1, 659, 0.22, 0.3)];
    case "ui":
      return knock(0, { band: 900, q: 4, body: 320, drop: 0.7, decay: 80, gain: 0.3, click: 0.1 });
  }
}

// Arcade: bipes e moedinhas, estilo videogame retrô (onda quadrada).
function arcade(event: SoundEvent): Voice[] {
  const blip = (at: number, freq: number, dur = 0.05, gain = 0.32, to?: number) =>
    tone(at, freq, dur, gain, 18, { wave: "square", attack: 0.001, to, glide: "exp" });
  const coin = (at: number) => [blip(at, 988, 0.06), blip(at + 0.06, 1319, 0.22, 0.3)];
  switch (event) {
    case "move":
      return [blip(0, 660, 0.045, 0.3, 520)];
    case "capture":
      return [blip(0, 440, 0.05, 0.34, 220), blip(0.05, 330, 0.08, 0.3, 165)];
    case "check":
      return [blip(0, 880, 0.07), blip(0.1, 880, 0.07)];
    case "castle":
      return [blip(0, 523, 0.05), blip(0.07, 659, 0.06)];
    case "promote":
      return [523, 659, 784, 1047].map((f, i) => blip(i * 0.05, f, 0.06));
    case "mate":
      return [784, 659, 523, 392].map((f, i) => blip(i * 0.08, f, 0.1, 0.3)).concat(blip(0.34, 262, 0.35, 0.28));
    case "correct":
      return coin(0);
    case "wrong":
      return [blip(0, 196, 0.12, 0.26, 165)];
    case "hint":
      return [blip(0, 1319, 0.05, 0.2), blip(0.06, 1568, 0.08, 0.2)];
    case "gameEnd":
      return [523, 392, 330].map((f, i) => blip(i * 0.09, f, 0.12, 0.26));
    case "solved":
      return [...coin(0), blip(0.3, 1568, 0.2, 0.26)];
    case "cycleEnd":
      return [523, 659, 784, 1047, 1319].map((f, i) => blip(i * 0.07, f, 0.09, 0.28));
    case "title":
      return [
        ...[392, 523, 659, 784, 1047].map((f, i) => blip(i * 0.08, f, 0.08, 0.28)),
        blip(0.42, 1047, 0.5, 0.28),
        blip(0.42, 784, 0.5, 0.18),
      ];
    case "brilliant":
      return [1319, 1568, 2093, 2637].map((f, i) => blip(i * 0.04, f, 0.07, 0.22));
    case "notification":
      return [blip(0, 1319, 0.05, 0.18), blip(0.07, 1760, 0.08, 0.18)];
    case "ui":
      return [blip(0, 1760, 0.02, 0.16)];
  }
}

// Engraçado: boing, pop, slide whistle e splat. O erro é bobo e leve, nunca
// um som de deboche.
function engracado(event: SoundEvent): Voice[] {
  const pop = (at: number, freq = 420, gain = 0.6) =>
    tone(at, freq, 0.07, gain, 45, { to: freq * 2.4, glide: "exp", attack: 0.001 });
  const boing = (at: number, from: number, to: number, dur = 0.35, gain = 0.45) =>
    tone(at, from, dur, gain, 7, { to, glide: "exp", vibrato: { rate: 14, depth: 0.06 } });
  const splat: Voice[] = [
    { kind: "noise", at: 0, dur: 0.18, gain: 0.9, decay: 22, attack: 0.002, filter: "lowpass", freq: 1800, to: 300, q: 0.8 },
    tone(0, 140, 0.12, 0.6, 30, { to: 80, glide: "exp" }),
  ];
  const whistle = (at: number, from: number, to: number, dur = 0.45) =>
    tone(at, from, dur, 0.36, 3, { to, glide: "exp", vibrato: { rate: 6, depth: 0.012 }, attack: 0.03 });
  switch (event) {
    case "move":
      return [pop(0)];
    case "capture":
      return splat;
    case "check":
      return [boing(0, 220, 660, 0.3)];
    case "castle":
      return [pop(0, 380), pop(0.09, 480)];
    case "promote":
      return [whistle(0, 500, 1600, 0.5)];
    case "mate":
      return [boing(0, 660, 220, 0.4), ...chord(0.32, [523, 659, 784], 0.07, (a, f) => [tone(a, f, 0.3, 0.32, 9, { wave: "triangle" })])];
    case "correct":
      return [boing(0, 330, 880, 0.25, 0.4)];
    case "wrong":
      // "Uh-oh" leve: duas notas curtas e descendentes.
      return [
        tone(0, 523, 0.14, 0.3, 14, { to: 494, wave: "triangle" }),
        tone(0.15, 392, 0.22, 0.28, 10, { to: 370, wave: "triangle" }),
      ];
    case "solved":
      return [pop(0, 420), pop(0.08, 520), pop(0.16, 640), boing(0.24, 440, 1100, 0.25, 0.35)];
    case "hint":
      return [pop(0, 600, 0.4), pop(0.09, 800, 0.35)];
    case "gameEnd":
      return [boing(0, 440, 330, 0.35, 0.35), pop(0.32, 500, 0.4)];
    case "cycleEnd":
      return [whistle(0, 400, 1400, 0.4), ...chord(0.42, [523, 659, 784, 1047], 0.07, (a, f) => [pop(a, f / 2, 0.45)])];
    case "title":
      return [whistle(0, 350, 1500, 0.55), ...chord(0.55, [523, 659, 784], 0, (a, f) => [tone(a, f, 0.7, 0.3, 4, { wave: "triangle" })])];
    case "brilliant":
      return [boing(0, 440, 1320, 0.3, 0.38), pop(0.28, 900, 0.4)];
    case "notification":
      return [pop(0, 600, 0.35), pop(0.1, 900, 0.3)];
    case "ui":
      return [pop(0, 700, 0.3)];
  }
}

const PACKS: Record<Exclude<SoundPack, "vibracao">, (event: SoundEvent) => Voice[]> = {
  suave,
  madeira,
  oco,
  arcade,
  engracado,
};

// Pacotes que tocam som. "vibracao" não toca áudio (ver VIBRATION_PATTERNS).
export function audioPackOf(pack: SoundPack): Exclude<SoundPack, "vibracao"> {
  return pack === "vibracao" ? "suave" : pack;
}

export function synthesize(
  event: SoundEvent,
  pack: SoundPack,
  sampleRate: number,
): Float32Array {
  const voices = PACKS[audioPackOf(pack)](event);
  return render(voices.length ? voices : suave(event), sampleRate);
}

// Vibração (pacote "Silencioso com vibração"): padrões curtos, em ms.
export const VIBRATION_PATTERNS: Record<SoundEvent, number[]> = {
  move: [12],
  capture: [22],
  check: [15, 40, 15],
  castle: [12, 40, 12],
  promote: [15, 30, 25],
  mate: [40, 50, 40],
  gameEnd: [30, 50, 30],
  hint: [8, 30, 8],
  correct: [10],
  wrong: [30, 40, 10],
  solved: [15, 30, 15, 30, 15],
  cycleEnd: [20, 30, 20, 30, 40],
  title: [30, 40, 30, 40, 60],
  brilliant: [10, 20, 10, 20, 30],
  notification: [10, 60, 10],
  ui: [6],
};

// Qual som tocar para um lance (dados no formato do chess.js).
export function soundForMove(move: { san: string; flags: string }): SoundEvent {
  if (move.san.includes("#")) return "mate";
  if (move.san.includes("+")) return "check";
  if (move.flags.includes("p")) return "promote";
  if (move.flags.includes("k") || move.flags.includes("q")) return "castle";
  if (move.flags.includes("c") || move.flags.includes("e")) return "capture";
  return "move";
}
