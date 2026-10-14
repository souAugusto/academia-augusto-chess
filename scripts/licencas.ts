// Confere as licenças das dependências de produção e gera a lista pública.
//   npm run licenses:check   -> falha se aparecer licença fora da lista permitida
//   npm run licenses:write   -> regrava public/licencas/THIRD_PARTY_LICENSES.txt
// O motor Stockfish (GPL) não entra aqui: ele não é dependência do site, é um
// programa separado servido em /engine/ (ver public/licencas/LEIA-ME.txt).
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const checker = require("license-checker-rseidelsohn") as {
  init: (
    options: {
      start: string;
      production: boolean;
      excludePrivatePackages?: boolean;
    },
    callback: (
      error: Error | null,
      packages: Record<string, PackageInfo>,
    ) => void,
  ) => void;
};

type PackageInfo = {
  licenses?: string | string[];
  repository?: string;
  publisher?: string;
};

// Licenças permissivas aceitas sem conversa.
const ALLOWED = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "CC0-1.0",
  "Unlicense",
  "BlueOak-1.0.0",
  "CC-BY-4.0", // exige atribuição: aparece na lista e em /creditos
]);

// Exceções conhecidas, por nome de pacote, com o motivo.
const EXCEPTIONS: { prefix: string; license: string; reason: string }[] = [
  {
    prefix: "@img/sharp-",
    license: "Apache-2.0 AND LGPL-3.0-or-later",
    reason:
      "biblioteca de imagens do Next.js (libvips, LGPL) usada só no servidor, como biblioteca dinâmica",
  },
  {
    // No Linux (build da Vercel) a libvips vem num pacote separado, só LGPL.
    prefix: "@img/sharp-libvips-",
    license: "LGPL-3.0-or-later",
    reason: "a mesma libvips, empacotada à parte no Linux",
  },
];

const OUTPUT = "public/licencas/THIRD_PARTY_LICENSES.txt";
const write = process.argv.includes("--write");

const licenseText = (info: PackageInfo) =>
  Array.isArray(info.licenses)
    ? info.licenses.join(" OR ")
    : (info.licenses ?? "DESCONHECIDA");

function isAllowed(name: string, license: string): boolean {
  if (
    EXCEPTIONS.some((e) => name.startsWith(e.prefix) && e.license === license)
  )
    return true;
  // "MIT OR Apache-2.0": basta uma das opções ser permitida.
  const options = license.replace(/[()]/g, "").split(/\s+OR\s+/);
  return options.some((option) => ALLOWED.has(option.trim()));
}

checker.init(
  { start: process.cwd(), production: true, excludePrivatePackages: true },
  (error, packages) => {
    if (error) {
      console.error("Não consegui ler as licenças:", error.message);
      process.exit(1);
    }
    const entries = Object.entries(packages).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const problems = entries.filter(
      ([name, info]) => !isAllowed(name, licenseText(info)),
    );
    if (problems.length > 0) {
      console.error("Licenças fora da lista permitida (scripts/licencas.ts):");
      for (const [name, info] of problems)
        console.error(`  - ${name}: ${licenseText(info)}`);
      process.exit(1);
    }
    if (write) {
      const lines = [
        "Componentes de terceiros usados pela Academia Finale de Xadrez",
        "(dependências de produção do site; gerado por scripts/licencas.ts)",
        "",
        "O motor Stockfish é um programa separado, com licença própria (GPL-3.0):",
        "veja /licencas/LEIA-ME.txt e /licencas/stockfish-GPL-3.0.txt.",
        "",
        ...entries.map(([name, info]) =>
          [
            name,
            `  Licença: ${licenseText(info)}`,
            info.repository ? `  Fonte: ${info.repository}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        ),
        "",
        "Exceções aceitas:",
        ...EXCEPTIONS.map((e) => `  ${e.prefix}*: ${e.license} (${e.reason})`),
        "",
      ];
      writeFileSync(OUTPUT, lines.join("\n"));
      console.log(`Lista gravada em ${OUTPUT} (${entries.length} pacotes).`);
    } else {
      console.log(
        `Licenças ok: ${entries.length} pacotes de produção dentro da lista permitida.`,
      );
    }
  },
);
