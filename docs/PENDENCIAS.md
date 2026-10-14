# Pendências que dependem do Augusto

- **Revisão jurídica da licença do Stockfish antes do lançamento comercial.**
  Arquitetura adotada: o motor (pacote npm `stockfish` 19.0.1, versão lite single-thread, GPLv3)
  é servido como arquivo estático separado em `/engine/`, sem modificação e fora do bundle do site.
  Roda num Web Worker e conversa com o site só por mensagens UCI (postMessage). O site não importa
  código interno do motor. Texto da licença, versão e link do código-fonte ficam em `/creditos`.
- **Hospedagem e APIs para uso comercial.** Conferir os termos da hospedagem atual (o plano gratuito
  da Vercel é voltado a uso não comercial) e os termos da API do Chess.com para uso comercial;
  avaliar alternativas gratuitas com uso comercial permitido, como Cloudflare Pages ou Netlify.
- **Revisar os textos jurídicos novos.** A cláusula "7. Componentes de terceiros" dos Termos e o
  parágrafo sobre a nuvem do Lichess na Privacidade foram escritos nesta rodada (rascunho, sem
  revisão de advogado). Os campos entre colchetes (razão social, CNPJ, foro, e-mail de suporte)
  continuam pendentes.
- **Exceção de licença do sharp/libvips (LGPL-3.0).** A biblioteca de imagens do Next.js usa a
  libvips (LGPL) no servidor. Foi aceita como exceção em `scripts/licencas.ts` por ser uma
  biblioteca dinâmica usada só no servidor; confirmar na revisão jurídica.
- **Limites de uso das APIs do Lichess.** A análise usa a nuvem de avaliações e o export de
  partidas do Lichess sem chave. Em caso de muito uso, o Lichess pode limitar as chamadas
  (o site já cai para o motor local quando a nuvem não responde).
- **Testar o som no iPhone (Safari) e no Android.** Testado em Chrome e Firefox no computador; não há iPhone no ambiente de desenvolvimento.
- **Proteção contra senhas vazadas desligada no Supabase Auth.** O verificador de segurança do Supabase recomenda ligar em Authentication > Policies (Leaked password protection). Depende do plano do Supabase.
- **Migration 0013** (tirar a exceção de admin na leitura das análises): escrita, aguardando "pode aplicar".
- **Revisar a lista de palavras proibidas em apelidos** (`src/content/apelidos-proibidos.ts`): é simples e editável; inclua ou tire o que achar melhor.
