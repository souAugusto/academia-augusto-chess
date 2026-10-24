import { AreaUnavailable } from "@/components/app/AreaUnavailable";
import { getSiteSettings, viewerIsAdmin } from "@/lib/data/site-settings";

// Aulas em vídeo podem ser desligadas pelo admin (Configurações do site).
// Desligadas: o aluno vê o aviso em qualquer endereço de /aulas; o admin
// continua vendo tudo, com uma faixa avisando que está oculto.
export default async function AulasLayout({ children }: LayoutProps<"/aulas">) {
  const settings = await getSiteSettings();
  if (settings.video_lessons_enabled) return children;
  if (!(await viewerIsAdmin()))
    return <AreaUnavailable title="Aulas em vídeo" />;
  return (
    <>
      <p
        role="status"
        className="rounded-control border border-border-strong bg-surface-2 px-4 py-2 text-sm text-muted"
      >
        Aulas em vídeo estão{" "}
        <strong className="text-text">ocultas para usuários</strong>. Só admins
        veem esta área. Para reexibir, use Admin › Configurações do site.
      </p>
      {children}
    </>
  );
}
