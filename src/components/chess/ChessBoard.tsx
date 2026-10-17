"use client";

import { Chess, type Square } from "chess.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Chessboard, type Arrow } from "react-chessboard";
import { useBoardPreferences } from "@/components/preferences/PreferencesProvider";
import {
  ANIMATION_OPTIONS,
  BOARD_THEME_OPTIONS,
  pieceUrl,
  type BoardColors,
} from "@/lib/preferences/options";
import { playSound } from "@/lib/sound";
import { soundForMove } from "@/lib/sound/synth";
import { pieceRenderer } from "./pieces";
import { useReducedMotion } from "./useReducedMotion";

// Cores de destaque que não dependem do tema (dica, acerto, erro, setas).
export const BOARD_COLORS = {
  selected: "rgb(108 122 224 / 0.55)",
  hint: "rgb(61 220 151 / 0.55)",
  ok: "rgb(61 220 151 / 0.6)",
  bad: "rgb(255 92 108 / 0.65)",
  arrow: "rgb(232 184 74 / 0.85)",
  arrowAlt: "rgb(108 122 224 / 0.8)",
};

export type Side = "w" | "b";

type ChessBoardProps = {
  id: string;
  fen: string;
  orientation: Side;
  movableColor: Side | null; // quem pode mover agora (null = ninguém)
  lastMove?: { from: string; to: string } | null;
  highlights?: Record<string, CSSProperties>; // destaques extras (dica, acerto, erro)
  arrows?: Arrow[];
  // "replay": os lances vêm da navegação por uma partida (análise, aulas) e não
  // contam como lance do adversário para a opção de som.
  soundMode?: "jogo" | "replay";
  // Selo no canto de uma casa (ex.: ícone da classe do lance na análise).
  badge?: { square: string; node: ReactNode } | null;
  // Retorna true se o lance foi aceito (a peça fica na casa nova).
  onMove: (from: Square, to: Square, promotion?: string) => boolean;
};

const PIECE_NAMES = { q: "Dama", r: "Torre", b: "Bispo", n: "Cavalo" } as const;
const FILES = "abcdefgh";

// O lance que leva de uma posição à outra (para tocar o som certo).
function moveBetween(before: string, after: string) {
  try {
    const chess = new Chess(before);
    const target = after.split(" ")[0];
    for (const move of chess.moves({ verbose: true })) {
      chess.move(move);
      const reached = chess.fen().split(" ")[0] === target;
      chess.undo();
      if (reached) return move;
    }
  } catch {
    // FEN inválido: sem som.
  }
  return null;
}

// Tabuleiro único do site: aplica as preferências do aluno (tema, peças,
// coordenadas, destaques, animação, forma de mover, promoção) e toca os sons
// dos lances. Todas as telas jogáveis usam este componente.
export function ChessBoard({
  id,
  fen,
  orientation,
  movableColor,
  lastMove,
  highlights = {},
  arrows = [],
  badge = null,
  soundMode = "jogo",
  onMove,
}: ChessBoardProps) {
  const { board, pieces, ready } = useBoardPreferences();
  const theme = BOARD_THEME_OPTIONS[board.theme].colors;
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  // Preferência "confirmar lance": o lance espera Confirmar ou Desfazer.
  const [pending, setPending] = useState<{
    from: Square;
    to: Square;
    promo?: string;
    fen: string;
  } | null>(null);
  const pendingMove = pending && pending.fen === fen ? pending : null;
  const reducedMotion = useReducedMotion();
  const canMove = movableColor !== null;
  const canDrag = canMove && board.moveMethod !== "clicar";
  const canClick = canMove && board.moveMethod !== "arrastar";
  const pieceSet = useMemo(() => pieceRenderer(pieces), [pieces]);

  // Som quando a posição muda por um lance. Lance aceito do aluno marca
  // ownMove; o próximo lance que não foi dele é do adversário.
  const previousFen = useRef(fen);
  const ownMove = useRef(false);
  useEffect(() => {
    const before = previousFen.current;
    previousFen.current = fen;
    if (before === fen) return;
    const mine = ownMove.current;
    ownMove.current = false;
    const move = moveBetween(before, fen);
    if (move)
      playSound(soundForMove(move), {
        opponent: soundMode === "jogo" && !mine,
      });
  }, [fen, soundMode]);

  function submit(from: Square, to: Square, promo?: string): boolean {
    const accepted = onMove(from, to, promo);
    if (accepted) ownMove.current = true;
    return accepted;
  }

  function attempt(from: Square, to: Square, promo?: string): boolean {
    if (!canMove) return false;
    const chess = new Chess(fen);
    const legal = chess
      .moves({ square: from, verbose: true })
      .filter((move) => move.to === to);
    if (legal.length === 0) return false;
    if (!promo && legal.some((move) => move.promotion)) {
      if (board.autoQueen) return attempt(from, to, "q");
      setPromotion({ from, to });
      return false;
    }
    setSelected(null);
    if (board.confirmMove) {
      setPending({ from, to, promo, fen });
      return false;
    }
    return submit(from, to, promo);
  }

  function confirmPending() {
    if (!pendingMove) return;
    const { from, to, promo } = pendingMove;
    setPending(null);
    submit(from, to, promo);
  }

  function onSquareClick(square: Square) {
    if (!canClick) return;
    const piece = new Chess(fen).get(square);
    if (selected && selected !== square) {
      const moved = attempt(selected, square);
      if (moved) return;
      if (!(piece && piece.color === movableColor)) {
        setSelected(null);
        return;
      }
    }
    setSelected(piece && piece.color === movableColor ? square : null);
  }

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove && board.lastMove) {
    squareStyles[lastMove.from] = { background: theme.lastMove };
    squareStyles[lastMove.to] = { background: theme.lastMove };
  }
  if (selected) {
    squareStyles[selected] = { background: BOARD_COLORS.selected };
    if (board.legalMoves)
      for (const move of new Chess(fen).moves({
        square: selected,
        verbose: true,
      })) {
        squareStyles[move.to] = {
          ...squareStyles[move.to],
          // Captura: anel na borda da casa, para não ficar escondido atrás da peça.
          backgroundImage: move.captured
            ? `radial-gradient(circle, transparent 62%, ${theme.legal} 64%)`
            : `radial-gradient(circle, ${theme.legal} 22%, transparent 24%)`,
        };
      }
  }
  // Xeque: anel em volta do rei (forma, não só cor).
  const position = new Chess(fen);
  if (position.inCheck()) {
    const king = position
      .board()
      .flat()
      .find((p) => p?.type === "k" && p.color === position.turn());
    if (king)
      squareStyles[king.square] = {
        ...squareStyles[king.square],
        background: `radial-gradient(circle, ${theme.check} 0 30%, transparent 72%)`,
        boxShadow: `inset 0 0 0 3px ${theme.check}`,
      };
  }
  for (const [square, style] of Object.entries(highlights)) {
    squareStyles[square] = { ...squareStyles[square], ...style };
  }

  const animationMs = ANIMATION_OPTIONS[board.animation].ms;
  const files = orientation === "w" ? FILES : [...FILES].reverse().join("");
  const ranks =
    orientation === "w" ? "87654321".split("") : "12345678".split("");

  // Antes de saber as preferências: só o quadrado do tabuleiro, vazio (sem
  // mostrar o tema padrão e depois trocar).
  if (!ready)
    return <div className="board-frame bg-surface-2" aria-hidden="true" />;

  // Setas na cor do tema (as telas mandam a cor padrão de seta).
  const themedArrows = arrows.map((arrow) =>
    arrow.color === BOARD_COLORS.arrow ? { ...arrow, color: theme.arrow } : arrow,
  );

  const frame = (
    <div className="board-frame" style={boardFrameStyle(theme)}>
      <Chessboard
        options={{
          id,
          position: fen,
          boardOrientation: orientation === "w" ? "white" : "black",
          pieces: pieceSet,
          darkSquareStyle: { backgroundColor: theme.dark },
          lightSquareStyle: { backgroundColor: theme.light },
          showNotation: board.coordinates === "dentro",
          // Coordenadas na cor da casa oposta (em vez do laranja padrão da biblioteca).
          darkSquareNotationStyle: { color: theme.light, fontWeight: 600 },
          lightSquareNotationStyle: { color: theme.dark, fontWeight: 600 },
          squareStyles,
          arrows: pendingMove
            ? [
                ...themedArrows,
                {
                  startSquare: pendingMove.from,
                  endSquare: pendingMove.to,
                  color: theme.arrow,
                },
              ]
            : themedArrows,
          allowDrawingArrows: true,
          showAnimations: !reducedMotion && animationMs > 0,
          animationDurationInMs: animationMs || 1,
          canDragPiece: ({ piece }) =>
            canDrag && piece.pieceType[0] === movableColor,
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare
              ? attempt(sourceSquare as Square, targetSquare as Square)
              : false,
          onSquareClick: ({ square }) => onSquareClick(square as Square),
        }}
      />

      {badge && <SquareBadge {...badge} orientation={orientation} />}

      {pendingMove && (
        <div
          role="group"
          aria-label="Confirmar o lance"
          className="absolute inset-x-2 bottom-2 z-10 flex justify-center gap-2"
        >
          <button
            type="button"
            onClick={confirmPending}
            className="min-h-touch rounded-control bg-accent px-5 font-semibold text-on-accent shadow-card"
          >
            Confirmar lance
          </button>
          <button
            type="button"
            onClick={() => setPending(null)}
            className="min-h-touch rounded-control border border-border-strong bg-surface px-5 font-semibold shadow-card"
          >
            Desfazer
          </button>
        </div>
      )}

      {promotion && movableColor && (
        <div
          role="dialog"
          aria-label="Escolha a peça da promoção"
          className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-sm"
        >
          <div className="flex gap-2 rounded-card border border-border bg-surface p-3 shadow-card">
            {(["q", "r", "b", "n"] as const).map((piece) => (
              <button
                key={piece}
                type="button"
                onClick={() => {
                  const { from, to } = promotion;
                  setPromotion(null);
                  attempt(from, to, piece);
                }}
                className="size-16 rounded-control bg-surface-2 p-1 hover:ring-2 hover:ring-accent"
              >
                <span className="sr-only">{PIECE_NAMES[piece]}</span>
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático */}
                <img
                  src={pieceUrl(
                    pieces,
                    `${movableColor}${piece.toUpperCase()}`,
                  )}
                  alt=""
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (board.coordinates !== "margem") return frame;
  // Coordenadas na margem: letras embaixo e números à esquerda, fora das casas.
  return (
    <div className="board-margin">
      <div className="board-margin__ranks" aria-hidden="true">
        {ranks.map((rank) => (
          <span key={rank}>{rank}</span>
        ))}
      </div>
      {frame}
      <span aria-hidden="true" />
      <div className="board-margin__files" aria-hidden="true">
        {[...files].map((file) => (
          <span key={file}>{file}</span>
        ))}
      </div>
    </div>
  );
}

// Posição de uma casa no tabuleiro, em porcentagem, conforme o lado de baixo.
function SquareBadge({
  square,
  node,
  orientation,
}: {
  square: string;
  node: ReactNode;
  orientation: Side;
}) {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]);
  if (file < 0 || !(rank >= 1 && rank <= 8)) return null;
  const col = orientation === "w" ? file : 7 - file;
  const row = orientation === "w" ? 8 - rank : rank - 1;
  return (
    <div
      className="pointer-events-none absolute z-10 flex justify-end"
      style={{
        left: `${col * 12.5}%`,
        top: `${row * 12.5}%`,
        width: "12.5%",
        height: "12.5%",
      }}
    >
      <div className="h-[46%] w-[46%] -translate-y-[12%] translate-x-[12%] drop-shadow-md [&>svg]:h-full [&>svg]:w-full">
        {node}
      </div>
    </div>
  );
}

// Moldura na cor do tema e contorno extra das peças (halo) onde a cor da peça
// some na casa. O halo vai por variável CSS, lida pelas imagens das peças.
export function boardFrameStyle(theme: BoardColors): CSSProperties {
  const halo = (color?: string) =>
    color
      ? `drop-shadow(0 0 0.6px ${color}) drop-shadow(0 0 0.6px ${color}) drop-shadow(0 0 0.6px ${color})`
      : "none";
  return {
    boxShadow: `0 0 0 3px ${theme.frame}, 0 12px 32px -20px var(--shadow-color)`,
    ["--piece-halo-w" as string]: halo(theme.halo?.w),
    ["--piece-halo-b" as string]: halo(theme.halo?.b),
  };
}
