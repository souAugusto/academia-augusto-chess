# Licenças de peças, sons, motor e dados

Só entram recursos cuja licença permite uso comercial, conferida na fonte original.

| Recurso | Autor | Licença | Fonte original | Texto |
|---|---|---|---|---|
| Peças "Clássico" (cburnett) | Colin M.L. Burnett | BSD 3-clause (o autor oferece GFDL, CC BY-SA 3.0, BSD ou GPLv2+, à escolha) | https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces | `pecas-cburnett-BSD.txt` |
| Peças "Moderno" (chessnut) | Alexis Luengas | Apache 2.0 | https://github.com/LexLuengas/chessnut-pieces | `pecas-chessnut-APACHE-2.0.txt`, `pecas-chessnut-NOTICE.txt` |
| Peças "Fantasia" (fantasy) e "Minimalista" (spatial) | Maurizio Monge | MIT | https://github.com/maurimo/chess-art (SVGs copiados de lichess-org/lila/public/piece, que também lista MIT) | `pecas-fantasy-spatial-MIT.txt` |
| Motor Stockfish 19 (lite, 1 thread, WebAssembly), pacote npm `stockfish` 19.0.1, sem modificação | T. Romstad, M. Costalba, J. Kiiski, G. Linscott e colaboradores; build de Nathan Rugg | GPL-3.0 | Código-fonte: https://github.com/nmrugg/stockfish.js/tree/v19.0.1 e https://github.com/official-stockfish/Stockfish | `stockfish-GPL-3.0.txt` (também em `public/engine/COPYING.txt` e `/licencas/stockfish-GPL-3.0.txt`) |
| Linhas de abertura para "Teoria" (`src/content/teoria-aberturas.json`) | lichess-org/chess-openings | CC0 | https://github.com/lichess-org/chess-openings | domínio público |
| Sons "Suave" e "Madeira" | Finale (gerados por código em `src/lib/sound/synth.ts`) | próprios | — | — |

## Descartados (licença não comercial ou incerta)

Conferido em lichess-org/lila COPYING.md em 2026-10-14:
- CC BY-NC-SA (não comercial): maestro, california, caliente, fresca, cardinal, icpieces, gioco, tatiana, staunty, dubrovny, anarcandy, disguised, cooke, monarchy, horsey, minimal-warmth, xkcd.
- "Free for personal non commercial use" ou sem licença clara: alpha, chess7, companion, leipzig, reillycraig, riohacha.
- GPL/AGPL (proibido no front pelo CLAUDE.md): merida, mono, letter, pirouetti, pixel, mpchess.
- Sons do Lichess: AGPL (futuristic, nes, piano, sfx) ou CC BY-NC-SA (lisp). Por isso os sons são próprios.

Nenhum som ou peça do Chess.com ou de outro produto proprietário é usado.
