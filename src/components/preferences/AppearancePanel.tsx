"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { buttonClasses } from "@/components/ui/button";
import {
  ANIMATION_OPTIONS,
  BOARD_THEME_OPTIONS,
  COORDINATE_OPTIONS,
  MOVE_METHOD_OPTIONS,
  PIECE_SET_OPTIONS,
  pieceUrl,
  SOUND_PACK_OPTIONS,
} from "@/lib/preferences/options";
import {
  SOUND_PACKS,
  type Preferences,
  type SoundPack,
} from "@/lib/preferences/schema";
import { playSample, playSound, vibrationSupported } from "@/lib/sound";
import { SOUND_EVENT_LABELS, type SoundEvent } from "@/lib/sound/synth";
import { usePreferences } from "./PreferencesProvider";

// Posição da pré-visualização: um lance jogado e uma captura possível.
const PREVIEW_FEN =
  "r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 3";
const PREVIEW_LAST = { from: "d2", to: "d4" };

const TEST_SOUNDS: SoundEvent[] = [
  "move",
  "capture",
  "check",
  "mate",
  "correct",
  "wrong",
  "solved",
  "brilliant",
];

const GROUP_LABELS: Record<keyof Preferences["sound"]["groups"], string> = {
  lances: "Sons dos lances (movimento, captura, xeque...)",
  feedback: "Sons de acerto, erro e conquistas",
  interface: "Sons de interface (cliques em botões e abas)",
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-card border border-border p-5">
      <legend className="px-1 text-sm font-semibold tracking-label text-accent-text uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Select<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-touch rounded-control border border-border-strong bg-surface px-3 text-base text-text focus:outline-2 focus:outline-offset-1 focus:outline-accent"
      >
        {(Object.entries(options) as [T, string][]).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-touch items-center gap-3 text-[0.9375rem]"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

// Painel único de aparência: tabuleiro, peças e sons, com pré-visualização ao
// vivo. Usado em Minha conta (Preferências) e na janela da engrenagem dos tabuleiros.
export function AppearancePanel({
  idPrefix = "ap",
  inDialog = false,
}: {
  idPrefix?: string;
  inDialog?: boolean; // na janela, a prévia gruda no topo da janela; na página, abaixo do cabeçalho
}) {
  const { prefs, update, reset } = usePreferences();
  const id = (name: string) => `${idPrefix}-${name}`;
  const setBoard = <K extends keyof Preferences["board"]>(
    key: K,
    value: Preferences["board"][K],
  ) => update((p) => ({ ...p, board: { ...p.board, [key]: value } }));
  const setSound = <K extends keyof Preferences["sound"]>(
    key: K,
    value: Preferences["sound"][K],
  ) => update((p) => ({ ...p, sound: { ...p.sound, [key]: value } }));
  const setGroup = (key: keyof Preferences["sound"]["groups"], value: boolean) =>
    update((p) => ({
      ...p,
      sound: { ...p.sound, groups: { ...p.sound.groups, [key]: value } },
    }));
  // "Só vibração" só aparece onde o aparelho vibra (confere no navegador).
  const [canVibrate, setCanVibrate] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- navigator só existe no navegador
    setCanVibrate(vibrationSupported());
  }, []);
  const packs = SOUND_PACKS.filter(
    (pack) => pack !== "vibracao" || canVibrate || prefs.sound.pack === pack,
  );
  const silent = prefs.sound.pack === "vibracao";

  const themes = Object.fromEntries(
    Object.entries(BOARD_THEME_OPTIONS).map(([k, v]) => [k, v.label]),
  ) as Record<Preferences["board"]["theme"], string>;
  const animations = Object.fromEntries(
    Object.entries(ANIMATION_OPTIONS).map(([k, v]) => [k, v.label]),
  ) as Record<Preferences["board"]["animation"], string>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-5">
        <Group title="Tabuleiro">
          <div
            role="radiogroup"
            aria-label="Tema de cores"
            id={id("tema")}
            className="grid grid-cols-3 gap-2 sm:grid-cols-4"
          >
            {(Object.keys(themes) as Preferences["board"]["theme"][]).map(
              (theme) => {
                const colors = BOARD_THEME_OPTIONS[theme].colors;
                const active = prefs.board.theme === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    data-theme-option={theme}
                    onClick={() => setBoard("theme", theme)}
                    className={`flex min-h-touch flex-col items-center gap-1.5 rounded-control border p-2 transition ${active ? "border-accent bg-surface-2 ring-1 ring-accent" : "border-border hover:border-border-strong"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-14 grid-cols-2 overflow-hidden rounded-[6px]"
                      style={{ boxShadow: `0 0 0 2px ${colors.frame}` }}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="relative"
                          style={{
                            backgroundColor:
                              i === 0 || i === 3 ? colors.light : colors.dark,
                          }}
                        >
                          {i === 1 && (
                            // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático
                            <img
                              src={pieceUrl(prefs.pieces, "wN")}
                              alt=""
                              className="absolute inset-0 size-full"
                              style={{ filter: "none" }}
                            />
                          )}
                          {i === 2 && (
                            // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático
                            <img
                              src={pieceUrl(prefs.pieces, "bQ")}
                              alt=""
                              className="absolute inset-0 size-full"
                              style={{
                                filter: colors.halo?.b
                                  ? `drop-shadow(0 0 0.6px ${colors.halo.b}) drop-shadow(0 0 0.6px ${colors.halo.b})`
                                  : "none",
                              }}
                            />
                          )}
                        </span>
                      ))}
                    </span>
                    <span className="text-center text-xs font-semibold leading-tight">
                      {themes[theme].replace(" (padrão)", "")}
                    </span>
                  </button>
                );
              },
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id={id("coordenadas")}
              label="Coordenadas"
              value={prefs.board.coordinates}
              options={COORDINATE_OPTIONS}
              onChange={(v) => setBoard("coordinates", v)}
            />
            <Select
              id={id("animacao")}
              label="Velocidade da animação"
              value={prefs.board.animation}
              options={animations}
              onChange={(v) => setBoard("animation", v)}
            />
            <Select
              id={id("mover")}
              label="Forma de mover"
              value={prefs.board.moveMethod}
              options={MOVE_METHOD_OPTIONS}
              onChange={(v) => setBoard("moveMethod", v)}
            />
          </div>
          <div className="flex flex-col">
            <Toggle
              id={id("ultimo")}
              label="Destacar o último lance"
              checked={prefs.board.lastMove}
              onChange={(v) => setBoard("lastMove", v)}
            />
            <Toggle
              id={id("possiveis")}
              label="Mostrar lances possíveis ao selecionar uma peça"
              checked={prefs.board.legalMoves}
              onChange={(v) => setBoard("legalMoves", v)}
            />
            <Toggle
              id={id("dama")}
              label="Promover direto para dama (sem perguntar)"
              checked={prefs.board.autoQueen}
              onChange={(v) => setBoard("autoQueen", v)}
            />
            <Toggle
              id={id("confirmar")}
              label="Confirmar o lance antes de ele valer"
              checked={prefs.board.confirmMove}
              onChange={(v) => setBoard("confirmMove", v)}
            />
          </div>
        </Group>

        <Group title="Peças">
          <div
            role="radiogroup"
            aria-label="Conjunto de peças"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {(Object.keys(PIECE_SET_OPTIONS) as Preferences["pieces"][]).map(
              (set) => {
                const active = prefs.pieces === set;
                return (
                  <button
                    key={set}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => update((p) => ({ ...p, pieces: set }))}
                    className={`flex flex-col items-center gap-2 rounded-control border p-3 transition ${active ? "border-accent bg-surface-2" : "border-border hover:border-border-strong"}`}
                  >
                    <span
                      className="grid grid-cols-4 overflow-hidden rounded-[6px]"
                      aria-hidden="true"
                    >
                      {["wK", "wN", "bQ", "bP"].map((code, i) => (
                        <span
                          key={code}
                          className="flex size-10 items-center justify-center"
                          style={{
                            backgroundColor:
                              i % 2 === 0
                                ? BOARD_THEME_OPTIONS[prefs.board.theme].colors.light
                                : BOARD_THEME_OPTIONS[prefs.board.theme].colors.dark,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático */}
                          <img
                            src={pieceUrl(set, code)}
                            alt=""
                            className="size-full"
                          />
                        </span>
                      ))}
                    </span>
                    <span className="text-sm font-semibold">
                      {PIECE_SET_OPTIONS[set].label}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </Group>

        <Group title="Sons">
          <Toggle
            id={id("som")}
            label="Sons ligados"
            checked={prefs.sound.enabled}
            onChange={(v) => setSound("enabled", v)}
          />
          {!silent && (
            <div className="flex flex-col gap-2">
              <label htmlFor={id("volume")} className="text-sm font-semibold">
                Volume: {prefs.sound.volume}
              </label>
              <input
                id={id("volume")}
                type="range"
                min={0}
                max={100}
                step={5}
                value={prefs.sound.volume}
                disabled={!prefs.sound.enabled}
                onChange={(event) =>
                  setSound("volume", Number(event.target.value))
                }
                className="accent-[var(--accent)]"
              />
            </div>
          )}
          <div
            role="radiogroup"
            aria-label="Pacote de sons"
            className="flex flex-col gap-2"
          >
            <span className="text-sm font-semibold">Pacote de sons</span>
            {packs.map((pack: SoundPack) => {
              const chosen = prefs.sound.pack === pack;
              return (
                <div
                  key={pack}
                  className={`flex items-center gap-2 rounded-control border p-2 ${chosen ? "border-accent bg-accent/10" : "border-border"}`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={chosen}
                    onClick={() => setSound("pack", pack)}
                    className="flex min-h-touch flex-1 flex-col items-start justify-center px-2 text-left"
                  >
                    <span className="text-[0.9375rem] font-semibold">
                      {SOUND_PACK_OPTIONS[pack].label}
                    </span>
                    <span className="text-xs text-muted">
                      {SOUND_PACK_OPTIONS[pack].description}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playSample(pack)}
                    aria-label={`Ouvir exemplo do pacote ${SOUND_PACK_OPTIONS[pack].label}`}
                    className={buttonClasses("secondary", "md", "shrink-0 px-3 text-sm")}
                  >
                    Ouvir exemplo
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col">
            {(Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[]).map(
              (group) => (
                <Toggle
                  key={group}
                  id={id(`grupo-${group}`)}
                  label={GROUP_LABELS[group]}
                  checked={prefs.sound.groups[group]}
                  onChange={(v) => setGroup(group, v)}
                />
              ),
            )}
            <Toggle
              id={id("adversario")}
              label="Tocar o som do lance do adversário"
              checked={prefs.sound.opponent}
              onChange={(v) => setSound("opponent", v)}
            />
          </div>
          {!silent && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Ouvir cada som</span>
              <div className="flex flex-wrap gap-2">
                {TEST_SOUNDS.map((event) => (
                  <button
                    key={event}
                    type="button"
                    disabled={!prefs.sound.enabled}
                    onClick={() => playSound(event)}
                    className={buttonClasses("secondary", "md", "text-sm")}
                  >
                    {SOUND_EVENT_LABELS[event]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Group>

        <div>
          <button
            type="button"
            onClick={() => {
              reset();
            }}
            className={buttonClasses("ghost")}
          >
            Restaurar padrão
          </button>
        </div>
      </div>

      {/* Celular: prévia pequena, fixa no topo enquanto as opções rolam.
          Desktop: coluna da direita, acompanhando a rolagem. */}
      <div
        className={`sticky ${inDialog ? "top-0" : "top-[var(--header-h)]"} z-10 order-first -mx-1 flex items-center gap-3 bg-bg px-1 py-2 lg:top-24 lg:order-none lg:mx-0 lg:flex-col lg:items-stretch lg:gap-2 lg:self-start lg:p-0`}
      >
        <span className="sr-only lg:not-sr-only lg:text-sm lg:font-semibold">
          Pré-visualização
        </span>
        <div className="w-36 shrink-0 sm:w-44 lg:w-full">
          <ChessBoard
            id={id("previa")}
            fen={PREVIEW_FEN}
            orientation="w"
            movableColor="b"
            lastMove={PREVIEW_LAST}
            onMove={() => false}
          />
        </div>
        <p className="text-[0.8125rem] text-muted">
          Toque numa peça preta para ver os lances possíveis. As mudanças valem
          na hora, em todos os tabuleiros do site.
        </p>
      </div>
    </div>
  );
}
