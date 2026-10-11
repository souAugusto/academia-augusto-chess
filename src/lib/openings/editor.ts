import { Chess } from "chess.js";
import { parseTypedMove, sanToPortuguese } from "../chess/notation.ts";
import { buildTree, listLines, type RepertoireNode } from "./tree.ts";

// Edição de repertório como texto: uma variante por linha, comentário entre chaves.
//   1. e4 {Ocupa o centro.} e5 2. Cf3 Cc6 3. Bc4
//   1. e4 e5 2. Cf3 d6 3. d4
// Lances em português ou inglês. Linhas com o mesmo começo viram um ramo só.

export type ParsedMove = { uci: string; san: string; comment: string | null };

export type ParseResult = { lines: ParsedMove[][]; errors: string[] };

const MOVE_NUMBER = /^\d+\.+$/;
const RESULT = /^(1-0|0-1|1\/2-1\/2|\*)$/;

function tokenize(line: string): string[] {
  return line.match(/\{[^}]*\}|[^\s{}]+/g) ?? [];
}

export function parseRepertoireText(text: string): ParseResult {
  const lines: ParsedMove[][] = [];
  const errors: string[] = [];

  text.split(/\r?\n/).forEach((raw, index) => {
    const row = raw.trim();
    if (!row || row.startsWith("#")) return;
    const chess = new Chess();
    const moves: ParsedMove[] = [];
    for (const token of tokenize(row)) {
      if (token.startsWith("{")) {
        const comment = token.slice(1, -1).trim();
        if (moves.length > 0 && comment)
          moves[moves.length - 1].comment = comment;
        continue;
      }
      if (MOVE_NUMBER.test(token) || RESULT.test(token)) continue;
      // "1.e4": número colado no lance
      const san = token.replace(/^\d+\.+/, "");
      const parsed = parseTypedMove(chess.fen(), san);
      if (!parsed) {
        errors.push(
          `Linha ${index + 1}: lance "${san}" não é válido nessa posição.`,
        );
        return;
      }
      const move = chess.move(parsed);
      moves.push({
        uci: `${move.from}${move.to}${move.promotion ?? ""}`,
        san: move.san,
        comment: null,
      });
    }
    if (moves.length > 0) lines.push(moves);
  });

  if (lines.length === 0 && errors.length === 0)
    errors.push("Escreva pelo menos uma linha de lances.");
  return { lines, errors };
}

// Texto para o editor a partir da árvore salva. O comentário de um lance sai só
// na primeira linha em que ele aparece.
export function treeToText(nodes: RepertoireNode[]): string {
  const seen = new Set<string>();
  return listLines(buildTree(nodes))
    .map((line) =>
      line
        .map((node, index) => {
          const number = index % 2 === 0 ? `${index / 2 + 1}. ` : "";
          const comment =
            node.comment && !seen.has(node.id) ? ` {${node.comment}}` : "";
          seen.add(node.id);
          return `${number}${sanToPortuguese(node.san)}${comment}`;
        })
        .join(" "),
    )
    .join("\n");
}

// Plano para gravar o texto sem perder o progresso dos alunos: nós que continuam
// existindo (mesmo caminho de lances) mantêm o id.
export type NodeInsert = {
  key: string; // id temporário, para os filhos acharem o pai
  parentId: string | null; // pai que já existe no banco
  parentKey: string | null; // ou chave de um pai novo
  uci: string;
  san: string;
  comment: string | null;
  position: number;
};

export type NodeUpdate = {
  id: string;
  comment: string | null;
  position: number;
};

export type SyncPlan = {
  inserts: NodeInsert[]; // o pai sempre vem antes do filho
  updates: NodeUpdate[];
  deletes: string[];
};

type Ref = { id: string; key?: undefined } | { key: string; id?: undefined };

export function planRepertoireSync(
  existing: RepertoireNode[],
  lines: ParsedMove[][],
): SyncPlan {
  const tree = buildTree(existing);
  const inserts: NodeInsert[] = [];
  const updates = new Map<string, NodeUpdate>();
  // Filhos já vistos por pai, na ordem do texto.
  const seen = new Map<string, Map<string, Ref>>();
  const refName = (ref: Ref | null) =>
    ref === null ? "raiz" : ref.id !== undefined ? ref.id : `novo:${ref.key}`;

  for (const line of lines) {
    let parent: Ref | null = null;
    for (const move of line) {
      const siblings: Map<string, Ref> =
        seen.get(refName(parent)) ?? new Map<string, Ref>();
      seen.set(refName(parent), siblings);
      let ref: Ref | undefined = siblings.get(move.uci);

      if (!ref) {
        const position = siblings.size;
        // Só procura no banco se o pai também já existe lá.
        const parentId: string | null = (parent as Ref | null)?.id ?? null;
        const parentIsNew: boolean = (parent as Ref | null)?.key !== undefined;
        const match: RepertoireNode | undefined = parentIsNew
          ? undefined
          : (tree.children.get(parentId) ?? []).find(
              (node) => node.uci === move.uci,
            );
        if (match) {
          ref = { id: match.id };
          updates.set(match.id, {
            id: match.id,
            comment: move.comment,
            position,
          });
        } else {
          ref = { key: String(inserts.length) };
          inserts.push({
            key: ref.key,
            parentId: parent?.id ?? null,
            parentKey: parent?.key ?? null,
            uci: move.uci,
            san: move.san,
            comment: move.comment,
            position,
          });
        }
        siblings.set(move.uci, ref);
      } else if (move.comment) {
        // Mesmo lance repetido em outra linha: vale o primeiro comentário escrito.
        const target =
          ref.id !== undefined ? updates.get(ref.id) : inserts[Number(ref.key)];
        if (target && !target.comment) target.comment = move.comment;
      }
      parent = ref;
    }
  }

  const changed = [...updates.values()].filter((update) => {
    const node = tree.nodes.get(update.id)!;
    return node.comment !== update.comment || node.position !== update.position;
  });
  const deletes = existing
    .filter((node) => !updates.has(node.id))
    .map((node) => node.id);
  return { inserts, updates: changed, deletes };
}
