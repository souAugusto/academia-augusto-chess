import {
  IconBoard,
  IconBranch,
  IconChart,
  IconFlag,
  IconHome,
  IconPlay,
  IconRobot,
  IconTarget,
} from "@/components/ui/icons";

// Áreas do app: usadas na navegação (desktop e barra inferior) e no Painel.
// `mobile: false` deixa a área fora da barra inferior (cabem só seis).
export const APP_SECTIONS = [
  { id: "painel", href: "/painel", label: "Painel", Icon: IconHome },
  { id: "taticas", href: "/taticas", label: "Táticas", Icon: IconTarget },
  { id: "aberturas", href: "/aberturas", label: "Aberturas", Icon: IconBranch },
  { id: "finais", href: "/finais", label: "Finais", Icon: IconFlag },
  { id: "partidas", href: "/partidas", label: "Partidas", Icon: IconBoard },
  { id: "aulas", href: "/aulas", label: "Aulas", Icon: IconPlay },
  {
    id: "jogar",
    href: "/jogar",
    label: "Jogar",
    Icon: IconRobot,
    mobile: false,
  },
  {
    id: "analise",
    href: "/analise",
    label: "Análise",
    Icon: IconChart,
    mobile: false,
  },
] as const;

export const MOBILE_SECTIONS = APP_SECTIONS.filter(
  (section) => !("mobile" in section) || section.mobile,
);

export type AppSectionId = (typeof APP_SECTIONS)[number]["id"];
