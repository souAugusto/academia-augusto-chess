import { BRAND } from "@/content/brand";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

// Imagem mostrada ao compartilhar o site (WhatsApp, Facebook, etc.).
export const alt = `${BRAND.fullName}: ${BRAND.description}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return renderOgImage(
    "Treino de xadrez com método.",
    "Táticas, aberturas, finais e aulas em vídeo.",
  );
}
