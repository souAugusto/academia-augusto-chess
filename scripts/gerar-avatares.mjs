// Gera os avatares dos personagens de "Jogar contra o computador":
// public/personagens/<id>/<expressao>.svg (normal, feliz, preocupado, surpreso).
//
// Uso: node scripts/gerar-avatares.mjs
//
// Desenhos originais da Academia Finale. Para trocar um avatar por uma arte
// própria, basta substituir os 4 arquivos SVG da pasta do personagem (mesmo
// nome de arquivo). Veja docs/PERSONAGENS.md.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "personagens");
const INK = "#1B1D26";
const SKIN = "#F2D3B3";
const CREAM = "#F5EEDC";

// Rosto: olhos, sobrancelhas e boca de cada expressão.
function face(expr, { cx = 60, cy = 62, eye = INK, gap = 11 } = {}) {
  const l = cx - gap;
  const r = cx + gap;
  const y = cy - 4;
  const s = `stroke="${eye}" stroke-width="3" stroke-linecap="round" fill="none"`;
  switch (expr) {
    case "feliz":
      return `
  <path d="M${l - 5} ${y + 2} Q${l} ${y - 5} ${l + 5} ${y + 2}" ${s}/>
  <path d="M${r - 5} ${y + 2} Q${r} ${y - 5} ${r + 5} ${y + 2}" ${s}/>
  <circle cx="${l - 6}" cy="${cy + 6}" r="4" fill="#F28B82" opacity="0.55"/>
  <circle cx="${r + 6}" cy="${cy + 6}" r="4" fill="#F28B82" opacity="0.55"/>
  <path d="M${cx - 11} ${cy + 7} Q${cx} ${cy + 21} ${cx + 11} ${cy + 7} Z" fill="${eye}"/>`;
    case "preocupado":
      return `
  <circle cx="${l}" cy="${y + 1}" r="3.5" fill="${eye}"/>
  <circle cx="${r}" cy="${y + 1}" r="3.5" fill="${eye}"/>
  <path d="M${l - 6} ${y - 6} L${l + 5} ${y - 10}" ${s}/>
  <path d="M${r - 5} ${y - 10} L${r + 6} ${y - 6}" ${s}/>
  <path d="M${cx - 9} ${cy + 13} Q${cx - 4} ${cy + 8} ${cx} ${cy + 12} Q${cx + 4} ${cy + 16} ${cx + 9} ${cy + 11}" ${s}/>`;
    case "surpreso":
      return `
  <circle cx="${l}" cy="${y}" r="5.5" fill="${eye}"/>
  <circle cx="${r}" cy="${y}" r="5.5" fill="${eye}"/>
  <circle cx="${l + 1.8}" cy="${y - 1.8}" r="1.6" fill="#FFFFFF"/>
  <circle cx="${r + 1.8}" cy="${y - 1.8}" r="1.6" fill="#FFFFFF"/>
  <path d="M${l - 6} ${y - 11} Q${l} ${y - 15} ${l + 6} ${y - 11}" ${s}/>
  <path d="M${r - 6} ${y - 11} Q${r} ${y - 15} ${r + 6} ${y - 11}" ${s}/>
  <ellipse cx="${cx}" cy="${cy + 13}" rx="4.5" ry="5.5" fill="${eye}"/>`;
    default:
      return `
  <circle cx="${l}" cy="${y}" r="4" fill="${eye}"/>
  <circle cx="${r}" cy="${y}" r="4" fill="${eye}"/>
  <circle cx="${l + 1.3}" cy="${y - 1.3}" r="1.2" fill="#FFFFFF"/>
  <circle cx="${r + 1.3}" cy="${y - 1.3}" r="1.2" fill="#FFFFFF"/>
  <path d="M${cx - 8} ${cy + 10} Q${cx} ${cy + 16} ${cx + 8} ${cy + 10}" ${s}/>`;
  }
}

const outline = `stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"`;

// Cada personagem: cor de fundo e o desenho (corpo, cabeça, acessórios, rosto).
const CHARACTERS = {
  "peaozinho-curioso": {
    color: "#3DBE8B",
    draw: (e) => `
  <path d="M28 120 L38 98 Q60 90 82 98 L92 120 Z" fill="${CREAM}" ${outline}/>
  <ellipse cx="60" cy="96" rx="22" ry="6" fill="${CREAM}" ${outline}/>
  <circle cx="60" cy="60" r="29" fill="${CREAM}" ${outline}/>
  <path d="M60 31 Q58 22 64 17" stroke="#2E8B57" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M64 17 Q72 14 74 21 Q66 24 64 17 Z" fill="#3DBE8B" stroke="#2E8B57" stroke-width="2"/>${face(e, { cy: 62 })}`,
  },
  "aprendiz-do-mosteiro": {
    color: "#B07A45",
    draw: (e) => `
  <path d="M22 120 Q26 92 60 90 Q94 92 98 120 Z" fill="#8A5A2B" ${outline}/>
  <path d="M60 22 Q96 24 96 66 Q96 96 60 98 Q24 96 24 66 Q24 24 60 22 Z" fill="#8A5A2B" ${outline}/>
  <ellipse cx="60" cy="64" rx="25" ry="27" fill="${SKIN}" ${outline}/>
  <path d="M44 103 L60 112 L76 103" stroke="#E8D4A8" stroke-width="3" fill="none"/>${face(e, { cy: 64, gap: 10 })}`,
  },
  "cavaleiro-atrapalhado": {
    color: "#5B8DEF",
    draw: (e) => `
  <path d="M26 120 Q30 94 60 92 Q90 94 94 120 Z" fill="#9AA4B8" ${outline}/>
  <g transform="rotate(-9 60 60)">
    <path d="M60 10 Q78 14 74 34" stroke="#E2574C" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="62" r="31" fill="#C9CED8" ${outline}/>
    <rect x="35" y="46" width="50" height="38" rx="14" fill="${SKIN}" ${outline}/>
    <path d="M33 46 L87 46" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="40" cy="40" r="2.2" fill="${INK}"/><circle cx="80" cy="40" r="2.2" fill="${INK}"/>
    ${face(e, { cy: 66, gap: 10 })}
  </g>`,
  },
  "bispo-sorrateiro": {
    color: "#9B6BDF",
    draw: (e) => `
  <path d="M26 120 Q30 94 60 92 Q90 94 94 120 Z" fill="#7A4FC2" ${outline}/>
  <path d="M60 8 Q84 26 80 46 L40 46 Q36 26 60 8 Z" fill="#7A4FC2" ${outline}/>
  <path d="M52 18 L66 40" stroke="${CREAM}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="60" cy="8" r="4.5" fill="#E8B84A" ${outline}/>
  <ellipse cx="60" cy="68" rx="25" ry="25" fill="${SKIN}" ${outline}/>
  <rect x="36" y="42" width="48" height="8" rx="3" fill="#E8B84A" ${outline}/>${face(e, { cy: 70, gap: 10 })}
  <path d="M72 56 L80 53" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>`,
  },
  "torre-de-ferro": {
    color: "#8A93A6",
    draw: (e) => `
  <path d="M30 120 L36 98 L84 98 L90 120 Z" fill="#B4BBC9" ${outline}/>
  <path d="M30 34 L30 20 L42 20 L42 28 L54 28 L54 20 L66 20 L66 28 L78 28 L78 20 L90 20 L90 34 Z" fill="#B4BBC9" ${outline}/>
  <rect x="32" y="32" width="56" height="66" rx="6" fill="#C9CED8" ${outline}/>
  <path d="M32 50 L88 50 M32 86 L88 86" stroke="#9AA3B8" stroke-width="2"/>${face(e, { cy: 68, gap: 12 })}`,
  },
  "rainha-estrategista": {
    color: "#2FB5B0",
    draw: (e) => `
  <path d="M24 120 Q28 92 60 90 Q92 92 96 120 Z" fill="#1F8C88" ${outline}/>
  <path d="M30 70 Q28 36 60 34 Q92 36 90 70 L90 96 Q84 88 82 70 L38 70 Q36 88 30 96 Z" fill="#3B2A22" ${outline}/>
  <ellipse cx="60" cy="66" rx="24" ry="26" fill="${SKIN}" ${outline}/>
  <path d="M36 42 L32 18 L46 30 L60 12 L74 30 L88 18 L84 42 Z" fill="#E8B84A" ${outline}/>
  <circle cx="32" cy="18" r="3.5" fill="#2FB5B0" ${outline}/><circle cx="60" cy="12" r="3.5" fill="#2FB5B0" ${outline}/><circle cx="88" cy="18" r="3.5" fill="#2FB5B0" ${outline}/>${face(e, { cy: 68, gap: 10 })}`,
  },
  "mestre-do-gambito": {
    color: "#E2574C",
    draw: (e) => `
  <path d="M24 120 Q28 92 60 90 Q92 92 96 120 Z" fill="#2B2E3A" ${outline}/>
  <path d="M50 92 L60 104 L70 92" fill="#E2574C" ${outline}/>
  <ellipse cx="60" cy="66" rx="26" ry="26" fill="${SKIN}" ${outline}/>
  <rect x="38" y="10" width="44" height="34" rx="4" fill="#2B2E3A" ${outline}/>
  <rect x="38" y="32" width="44" height="7" fill="#E2574C"/>
  <rect x="28" y="40" width="64" height="7" rx="3.5" fill="#2B2E3A" ${outline}/>${face(e, { cy: 66, gap: 10 })}
  <path d="M60 74 Q50 70 44 76 Q48 72 52 76 Q56 77 60 74 Q64 77 68 76 Q72 72 76 76 Q70 70 60 74 Z" fill="#5A3A22" stroke="#5A3A22" stroke-width="1.5"/>`,
  },
  "fantasma-do-finale": {
    color: "#8FB8E8",
    draw: (e) => `
  <path d="M26 112 L26 60 Q26 22 60 22 Q94 22 94 60 L94 112 Q86 104 80 112 Q72 120 66 110 Q60 102 54 110 Q48 120 40 112 Q34 104 26 112 Z" fill="#EEF4FF" ${outline}/>
  <ellipse cx="40" cy="78" rx="5" ry="3" fill="#C8D8F2"/>${face(e, { cy: 60, gap: 12 })}`,
  },
  "grande-mestre-das-sombras": {
    color: "#6E5BC8",
    draw: (e) => `
  <path d="M20 120 Q24 88 60 86 Q96 88 100 120 Z" fill="#231E38" ${outline}/>
  <path d="M60 14 Q100 18 98 66 Q98 100 60 102 Q22 100 22 66 Q20 18 60 14 Z" fill="#231E38" ${outline}/>
  <ellipse cx="60" cy="66" rx="25" ry="28" fill="#3B3358" stroke="#16122A" stroke-width="2.5"/>
  <path d="M38 50 Q60 40 82 50" stroke="#16122A" stroke-width="5" fill="none"/>${face(e, { cy: 68, gap: 10, eye: "#CDBBFF" })}`,
  },
  "o-rei-final": {
    color: "#E8B84A",
    draw: (e) => `
  <path d="M22 120 Q26 90 60 88 Q94 90 98 120 Z" fill="#B23A3A" ${outline}/>
  <path d="M30 100 Q60 112 90 100" stroke="${CREAM}" stroke-width="6" fill="none"/>
  <ellipse cx="60" cy="64" rx="26" ry="26" fill="${SKIN}" ${outline}/>
  <path d="M36 74 Q38 102 60 104 Q82 102 84 74 Q78 90 60 90 Q42 90 36 74 Z" fill="#E7E2D6" ${outline}/>
  <path d="M34 44 L34 24 L46 34 L60 20 L74 34 L86 24 L86 44 Z" fill="#E8B84A" ${outline}/>
  <path d="M60 4 L60 18 M54 10 L66 10" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M60 4 L60 18 M54 10 L66 10" stroke="#E8B84A" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="60" cy="36" r="3.5" fill="#B23A3A" ${outline}/>${face(e, { cy: 62, gap: 10 })}`,
  },
};

const EXPRESSIONS = ["normal", "feliz", "preocupado", "surpreso"];

for (const [id, { color, draw }] of Object.entries(CHARACTERS)) {
  mkdirSync(join(OUT, id), { recursive: true });
  for (const expr of EXPRESSIONS) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs><clipPath id="c"><circle cx="60" cy="60" r="60"/></clipPath></defs>
  <g clip-path="url(#c)">
  <circle cx="60" cy="60" r="60" fill="${color}"/>
  <circle cx="60" cy="60" r="60" fill="#FFFFFF" opacity="0.18"/>${draw(expr)}
  </g>
</svg>
`;
    writeFileSync(join(OUT, id, `${expr}.svg`), svg);
  }
}
console.log(`Avatares gerados em ${OUT}`);
