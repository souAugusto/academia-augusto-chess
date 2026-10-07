import {
  IconBranch,
  IconFlag,
  IconHome,
  IconPlay,
  IconTarget,
} from "@/components/ui/icons";

// Áreas do app: usadas na navegação (desktop e barra inferior) e na Home.
export const APP_SECTIONS = [
  { id: "painel", href: "/painel", label: "Painel", Icon: IconHome },
  { id: "taticas", href: "/taticas", label: "Táticas", Icon: IconTarget },
  { id: "aberturas", href: "/aberturas", label: "Aberturas", Icon: IconBranch },
  { id: "finais", href: "/finais", label: "Finais", Icon: IconFlag },
  { id: "aulas", href: "/aulas", label: "Aulas", Icon: IconPlay },
] as const;

export type AppSectionId = (typeof APP_SECTIONS)[number]["id"];
