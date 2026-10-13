# Pendências que dependem do Augusto

- **Revisão jurídica da licença do Stockfish antes do lançamento comercial.**
  Arquitetura adotada: o motor (pacote npm `stockfish` 19.0.1, versão lite single-thread, GPLv3)
  é servido como arquivo estático separado em `/engine/`, sem modificação e fora do bundle do site.
  Roda num Web Worker e conversa com o site só por mensagens UCI (postMessage). O site não importa
  código interno do motor. Texto da licença, versão e link do código-fonte ficam em `/creditos`.
- **Hospedagem e APIs para uso comercial.** Conferir os termos da hospedagem atual (o plano gratuito
  da Vercel é voltado a uso não comercial) e os termos da API do Chess.com para uso comercial;
  avaliar alternativas gratuitas com uso comercial permitido, como Cloudflare Pages ou Netlify.
