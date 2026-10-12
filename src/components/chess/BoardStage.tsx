import type { ReactNode } from "react";

type BoardStageProps = {
  board: ReactNode;
  info?: ReactNode; // topo do painel: título, quem joga, rating
  children?: ReactNode; // miolo: feedback e conteúdo
  actions?: ReactNode; // base do painel, alinhada com a base do tabuleiro
  below?: ReactNode; // o que não pertence ao bloco (filtros, textos longos)
  variant?: "lesson";
};

// Tabuleiro e painel num bloco só (estilos em globals.css, ".board-stage").
// Celular: informação acima, tabuleiro de ponta a ponta, controles logo abaixo.
// Desktop: painel à direita com a mesma altura do tabuleiro.
export function BoardStage({
  board,
  info,
  children,
  actions,
  below,
  variant,
}: BoardStageProps) {
  return (
    <>
      <div
        className={`board-stage ${variant === "lesson" ? "board-stage--lesson" : ""}`}
      >
        <div className="board-stage__board">{board}</div>
        <div className="board-stage__panel">
          {info && <div className="board-stage__info">{info}</div>}
          {children && <div className="board-stage__body">{children}</div>}
          {actions && <div className="board-stage__actions">{actions}</div>}
        </div>
      </div>
      {/* Embrulhado num div: o conteúdo pode vir de um Server Component. */}
      {below && <div className="flex flex-col gap-4">{below}</div>}
    </>
  );
}
