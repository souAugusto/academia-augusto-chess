// Página provisória da Fase 0. A Home completa entra na Fase 1.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-titulo text-4xl text-texto sm:text-5xl">
        Academia Augusto Chess
      </h1>
      <p className="text-lg text-texto-secundario">
        Treine xadrez todo dia e evolua junto com a comunidade.
      </p>
      <p className="text-texto-discreto">
        Site em construção. Enquanto isso, acompanhe as lives no{" "}
        <a
          href="https://www.tiktok.com/@augustochess"
          className="text-dourado underline underline-offset-4"
        >
          TikTok @augustochess
        </a>
        .
      </p>
    </main>
  );
}
