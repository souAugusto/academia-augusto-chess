import "server-only";
import { bestOpeningName } from "@/lib/openings/catalog";
import {
  buildTree,
  fenAfter,
  listLines,
  pathTo,
  toEpd,
  type RepertoireNode,
} from "@/lib/openings/tree";
import { createClient } from "@/lib/supabase/server";

// Repertórios de aberturas. O RLS filtra pelo plano e por publicação.

export type RepertoireSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  color: "white" | "black";
  lines: number;
  trained: number;
};

export type ProgressEntry = {
  leafId: string;
  correct: number;
  mistakes: number;
  lastTrainedAt: number;
};

export type RepertoireDetail = Omit<RepertoireSummary, "lines" | "trained"> & {
  nodes: RepertoireNode[];
  progress: ProgressEntry[];
  openingNames: Record<string, string>; // id do nó -> nome da abertura naquela posição
};

type NodeRow = {
  id: string;
  parent_id: string | null;
  uci: string;
  san: string;
  comment: string | null;
  position: number;
};

const toNode = (row: NodeRow): RepertoireNode => ({
  id: row.id,
  parentId: row.parent_id,
  uci: row.uci,
  san: row.san,
  comment: row.comment,
  position: row.position,
});

export async function listRepertoires(): Promise<RepertoireSummary[]> {
  const supabase = await createClient();
  const [{ data: repertoires }, { data: progress }] = await Promise.all([
    supabase
      .from("repertoires")
      .select(
        "id, slug, title, description, color, repertoire_nodes (id, parent_id, uci, san, comment, position)",
      )
      .order("position"),
    supabase.from("repertoire_progress").select("repertoire_id, leaf_id"),
  ]);
  return (repertoires ?? []).map((row) => {
    const lines = listLines(
      buildTree(((row.repertoire_nodes ?? []) as NodeRow[]).map(toNode)),
    );
    const leaves = new Set(lines.map((line) => line.at(-1)!.id));
    const trained = (progress ?? []).filter(
      (entry) => entry.repertoire_id === row.id && leaves.has(entry.leaf_id),
    ).length;
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      color: row.color as "white" | "black",
      lines: lines.length,
      trained,
    };
  });
}

export async function getRepertoire(
  slug: string,
): Promise<RepertoireDetail | null> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("repertoires")
    .select(
      "id, slug, title, description, color, repertoire_nodes (id, parent_id, uci, san, comment, position)",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (!row) return null;

  const nodes = ((row.repertoire_nodes ?? []) as NodeRow[]).map(toNode);
  const tree = buildTree(nodes);
  const epdByNode = new Map(
    nodes.map((node) => [node.id, toEpd(fenAfter(pathTo(tree, node.id)))]),
  );

  const [{ data: progress }, { data: openings }] = await Promise.all([
    supabase
      .from("repertoire_progress")
      .select("leaf_id, correct_count, mistake_count, last_trained_at")
      .eq("repertoire_id", row.id),
    supabase
      .from("openings")
      .select("eco, name, uci, epd")
      .in("epd", [...new Set(epdByNode.values())]),
  ]);

  const openingNames: Record<string, string> = {};
  for (const [nodeId, epd] of epdByNode) {
    const name = bestOpeningName(
      (openings ?? []).filter((opening) => opening.epd === epd),
    );
    if (name) openingNames[nodeId] = name;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    color: row.color as "white" | "black",
    nodes,
    openingNames,
    progress: (progress ?? []).map((entry) => ({
      leafId: entry.leaf_id,
      correct: entry.correct_count,
      mistakes: entry.mistake_count,
      lastTrainedAt: new Date(entry.last_trained_at).getTime(),
    })),
  };
}
