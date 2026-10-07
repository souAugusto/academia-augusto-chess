import {
  IconBranch,
  IconFlag,
  IconHome,
  IconPlay,
  IconTarget,
} from "@/components/ui/icons";

// Ícone de cada área do app, por id (Home, painel, páginas provisórias).
export function SectionIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  switch (id) {
    case "painel":
      return <IconHome className={className} />;
    case "aberturas":
      return <IconBranch className={className} />;
    case "finais":
      return <IconFlag className={className} />;
    case "aulas":
      return <IconPlay className={className} />;
    default:
      return <IconTarget className={className} />;
  }
}
