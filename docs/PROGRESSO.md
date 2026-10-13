# Progresso da rodada autônoma

## Estado atual
- Rodada concluída. Todas as caixas do `docs/CHECKLIST.md` estão marcadas.
- Branch: `feat/licoes-analise-landing` (nada foi para a `main`; merge e deploy de produção ficam com o Augusto).
- Conteúdo: 32 lições de aberturas (253 exercícios) e 35 lições de finais (214 posições), todas validadas (`npm run validate:content`) e conferidas pelo motor (`npm run verify:engine`). Restam 2 avisos dentro da tolerância (Sistema Londres prática 7 e Índia do Rei prática 8).
- Testes: 239 passando; lint, typecheck e build ok.
- Decisões abertas: nenhuma. Arquivos parcialmente escritos: nenhum.

## Reconhecimento (2026-10-13)
- **Stack:**
  - Next.js 16 (App Router, `src/proxy.ts` no lugar do middleware), TypeScript estrito e Tailwind 4 com tokens em `src/app/globals.css` (tema Midnight Gold, claro/escuro);
  - Supabase (Auth, Postgres com RLS, `@supabase/ssr`) e Vitest;
  - deploy na Vercel (projeto `finale-xadrez`).
- **Rotas do aluno** (grupo `(app)`, login obrigatório via `src/lib/routes.ts`): `/painel`, `/taticas`, `/aberturas` e `/aberturas/[repertorio]`, `/finais` e `/finais/[posicao]`, `/aulas/...`, `/treino` (Intensivo), `/partidas`, `/questionario`, `/conta`, `/checkout`.
- **Rotas públicas:** `/`, `/planos`, `/puzzle-do-dia`, `/creditos`, `/termos` e `/privacidade`.
- **Admin:** `/admin/...`.
- **Planos:**
  - Membro (rank 1) e Intensivo (rank 2), sem plano gratuito (regra do CLAUDE.md);
  - o acesso é conferido no servidor (`requireUser().planRank`, `checkPlan`) e reforçado por RLS (`my_plan_rank()`).
- **Tabuleiro:**
  - `PlayBoard` (react-chessboard, MIT) com peças Cburnett;
  - `BoardStage` (bloco tabuleiro + painel, estilos `.board-stage` em `globals.css`);
  - `MoveInput` (lance digitado em PT/EN);
  - `StaticBoard` (só exibição).
- **"Aberturas" hoje:**
  - repertórios em árvore (tabelas `repertoires`/`repertoire_nodes`, editor em texto no admin);
  - modos Estudar e Treinar (`RepertoireTrainer`).
  - Não existem "lições" com passos, armadilhas, prática por nível e quiz.
- **"Finais" hoje:**
  - posições no banco (`endgames`);
  - treino contra o Stockfish no Worker (`EndgameTrainer`, `src/lib/engine/client.ts`) com classificação de lances.
  - Não existem lições com teoria e prática por níveis.
- **Prática:** puzzles de táticas (`PuzzleBoard`, `src/lib/chess/solver.ts`) e o Método Padrão Finale (`/treino`).
- **Motor:**
  - Stockfish 19 lite single-thread em `public/engine/`, copiado sem modificação do npm `stockfish@19.0.1`;
  - aviso GPL em `/creditos`;
  - cliente UCI em `src/lib/engine/client.ts` (por tempo, sem multipv).
- **Partidas importadas:** tabela `imported_games` (sem PGN: só metadados) e contas em `linked_accounts`; leitura das APIs em `src/lib/games/`.
- **Estilo de jogo:** `src/lib/style/` (5 estilos, 10 perguntas); selo em `player_styles` (leitura pública).
- **Migrations aplicadas:** 0001 a 0010.

### Como o novo conteúdo vai encaixar
- **Lições** (aberturas e finais): conteúdo em arquivos TS em `src/content/licoes/`, separado da interface e validado por `scripts/validar-conteudo.ts` (chess.js) no `prebuild` e nos testes. O progresso do aluno fica numa tabela nova e aditiva.
- **Interface:** rotas novas `/licoes/...`, reaproveitando `PlayBoard`, `BoardStage` e `MoveInput`. As páginas `/aberturas` e `/finais` ganham atalho para as lições, sem mudar os repertórios nem o treino contra o motor.
- **Análise:** rota nova `/analise`, que estende o cliente do motor com profundidade e multipv sem mexer no uso atual dos finais.

## Histórico
- 2026-10-13: início da rodada, branch `feat/licoes-analise-landing` criada a partir da `main`.
- 2026-10-13: lições de finais completas (35), landing nova com SEO, três ciclos de melhoria, correção do build da Vercel (licença da libvips no Linux).
