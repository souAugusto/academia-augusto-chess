// Roda antes do build (npm "prebuild"). Em produção na Vercel, falha o build se
// houver placeholder "[MAIÚSCULAS]" nos arquivos da interface. Fora de produção,
// só avisa. Executado direto pelo Node 24 (remoção de tipos nativa).
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { findPlaceholders } from "../src/lib/placeholders.ts";

const ROOT = join(import.meta.dirname, "..");
const UI_DIRS = ["src/app", "src/components"];
const EXTENSIONS = /\.(tsx?|mdx?)$/;

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && EXTENSIONS.test(entry.name))
    .filter((entry) => !/\.test\.tsx?$/.test(entry.name))
    .map((entry) => join(entry.parentPath, entry.name));
}

const found = UI_DIRS.flatMap((dir) => listFiles(join(ROOT, dir))).flatMap(
  (file) =>
    findPlaceholders(readFileSync(file, "utf8")).map(
      (match) => `${relative(ROOT, file)}:${match.line}  ${match.text}`,
    ),
);

const isProduction = process.env.VERCEL_ENV === "production";

if (found.length === 0) {
  console.log("Placeholders: nenhum encontrado.");
} else if (isProduction) {
  console.error("Deploy de produção bloqueado. Placeholders pendentes:");
  found.forEach((line) => console.error(`  ${line}`));
  process.exit(1);
} else {
  console.warn(
    "Aviso: placeholders pendentes (bloqueiam o deploy de produção):",
  );
  found.forEach((line) => console.warn(`  ${line}`));
}
