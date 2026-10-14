// Confere todo o conteúdo das lições (lances legais, FEN válido, solução definida).
// Roda no build (prebuild) e falha se houver qualquer problema.
// Uso: npm run validate:content
import { ALL_LESSONS, contentCounts } from "../src/content/licoes/index.ts";
import { validateLessons } from "../src/lib/lessons/validate.ts";

const errors = validateLessons(ALL_LESSONS);
const counts = contentCounts();

if (errors.length > 0) {
  console.error(`Conteúdo das lições com ${errors.length} problema(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `Conteúdo ok: ${counts.openingLessons} lições de aberturas (${counts.openingDrills} exercícios), ` +
    `${counts.endgameLessons} lições de finais (${counts.endgamePositions} posições).`,
);
