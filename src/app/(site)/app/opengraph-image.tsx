import { BRAND } from "@/content/brand";
import { OG_SIZE, renderOgImage } from "@/lib/seo/og-image";

export const alt = `App da ${BRAND.fullName}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function AppOpenGraphImage() {
  return renderOgImage(
    "A Finale na tela inicial do seu celular.",
    "Instale grátis no Android ou no iPhone, sem loja de apps.",
  );
}
