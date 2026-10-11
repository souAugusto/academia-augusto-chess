import { Chess } from "chess.js";

// Árvore de um repertório de aberturas (PROMPT_MESTRE.md, seção 6).

export type RepertoireNode = {
  id: string;
  parentId: string | null;
  uci: string;
  san: string;
  comment: string | null;
  position: number;
};

export type Tree = {
  nodes: Map<string, RepertoireNode>;
  children: Map<string | null, RepertoireNode[]>; // null = lances iniciais
};

export function buildTree(nodes: RepertoireNode[]): Tree {
  const children = new Map<string | null, RepertoireNode[]>();
  for (const node of nodes) {
    const list = children.get(node.parentId) ?? [];
    list.push(node);
    children.set(node.parentId, list);
  }
  for (const list of children.values())
    list.sort((a, b) => a.position - b.position);
  return { nodes: new Map(nodes.map((node) => [node.id, node])), children };
}

export function childrenOf(
  tree: Tree,
  nodeId: string | null,
): RepertoireNode[] {
  return tree.children.get(nodeId) ?? [];
}

// Todas as linhas da árvore (da raiz até cada folha), na ordem dos lances principais.
export function listLines(tree: Tree): RepertoireNode[][] {
  const lines: RepertoireNode[][] = [];
  const walk = (parentId: string | null, path: RepertoireNode[]) => {
    const next = childrenOf(tree, parentId);
    if (next.length === 0) {
      if (path.length > 0) lines.push(path);
      return;
    }
    for (const node of next) walk(node.id, [...path, node]);
  };
  walk(null, []);
  return lines;
}

// Caminho da raiz até um nó (para estudar a partir de qualquer ponto).
export function pathTo(tree: Tree, nodeId: string | null): RepertoireNode[] {
  const path: RepertoireNode[] = [];
  let current = nodeId ? tree.nodes.get(nodeId) : undefined;
  while (current) {
    path.unshift(current);
    current = current.parentId ? tree.nodes.get(current.parentId) : undefined;
  }
  return path;
}

export function fenAfter(path: RepertoireNode[], startFen?: string): string {
  const chess = startFen ? new Chess(startFen) : new Chess();
  for (const node of path) {
    chess.move({
      from: node.uci.slice(0, 2),
      to: node.uci.slice(2, 4),
      promotion: node.uci[4],
    });
  }
  return chess.fen();
}

// FEN sem os contadores de lances: identifica a posição para achar o nome da abertura.
export function toEpd(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

export type LineProgress = {
  correct: number;
  mistakes: number;
  lastTrainedAt: number;
};

// Próxima linha para treinar: primeiro as nunca treinadas, depois as com mais
// erros proporcionais, e no empate a treinada há mais tempo.
export function pickLine(
  lines: RepertoireNode[][],
  progress: Map<string, LineProgress>,
  exclude?: string,
): RepertoireNode[] | null {
  const candidates = lines.filter((line) => line.at(-1)?.id !== exclude);
  const pool = candidates.length > 0 ? candidates : lines;
  if (pool.length === 0) return null;
  const score = (line: RepertoireNode[]) => {
    const stats = progress.get(line.at(-1)!.id);
    if (!stats) return { untrained: 1, ratio: 0, age: 0 };
    const total = stats.correct + stats.mistakes;
    return {
      untrained: 0,
      ratio: total ? stats.mistakes / total : 0,
      age: -stats.lastTrainedAt,
    };
  };
  return [...pool].sort((a, b) => {
    const sa = score(a);
    const sb = score(b);
    return (
      sb.untrained - sa.untrained || sb.ratio - sa.ratio || sb.age - sa.age
    );
  })[0];
}

export type TrainingVerdict =
  | { kind: "correct" }
  | { kind: "alternative"; expected: RepertoireNode } // está no repertório, mas a linha é outra
  | { kind: "wrong"; expected: RepertoireNode };

// Confere o lance do aluno no índice `index` da linha sendo treinada.
export function judgeTrainingMove(
  tree: Tree,
  line: RepertoireNode[],
  index: number,
  played: string,
): TrainingVerdict {
  const expected = line[index];
  if (played === expected.uci) return { kind: "correct" };
  const siblings = childrenOf(tree, expected.parentId);
  if (siblings.some((node) => node.uci === played))
    return { kind: "alternative", expected };
  return { kind: "wrong", expected };
}

export function userMovesFirst(color: "white" | "black"): boolean {
  return color === "white";
}
