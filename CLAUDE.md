# CLAUDE.md: Academia Finale de Xadrez

Plataforma de assinatura de treino de xadrez (táticas, aberturas, finais e aulas em vídeo). Planos pagos: Membro R$ 19/mês e Intensivo R$ 119/mês com turma de 10. Detalhes completos em `PROMPT_MESTRE.md`. Em caso de conflito, o `PROMPT_MESTRE.md` manda.

## Stack
Next.js 16 (App Router) + TypeScript + Tailwind 4 · Supabase (Auth, Postgres, RLS, `@supabase/ssr`) · react-chessboard (MIT) + chess.js (BSD) · Stockfish WASM em Web Worker · Framer Motion · Vercel · Vitest. Pagamento (Asaas) e vídeo (YouTube) ficam atrás de interfaces (`src/lib/payments/`, `src/lib/video/`).

## Comandos
- `npm run dev`: servidor local
- `npm run lint`, `npm run typecheck` e `npm run test`: rodar antes de cada entrega
- `npm run build`: precisa passar antes de qualquer deploy
- `supabase db push`: aplica migrations (pedir confirmação antes de rodar contra o projeto de produção)

## Regras que nunca quebram
1. Nunca colocar chave, senha ou token no código ou no Git. Só variáveis de ambiente. Segredos (service role, chaves de pagamento) nunca com prefixo `NEXT_PUBLIC_`.
2. Toda tabela nova nasce com RLS ligado e policies. Mudanças de banco só por migration em `supabase/migrations/`, numeradas.
3. Acesso por plano é checado no servidor. Esconder botão no front não conta como proteção.
4. Escritas em `subscriptions`, `seat_reservations` e eventos de pagamento só pelo servidor com a service role.
5. Webhook de pagamento: verificar assinatura com o corpo bruto e garantir idempotência.
6. Validar toda entrada no servidor (Zod). Não confiar em `user_id` ou `plan` vindos do cliente.
7. Não existe plano gratuito. Não criar fluxo "grátis". O puzzle do dia é a única parte pública jogável.
8. Não prometer resultado (ex.: "suba X pontos de rating") em nenhum texto.
9. Nada do mestre convidado (nome, foto, currículo) aparece no site até o Augusto liberar.
10. Só conteúdo aberto (Lichess CC0, `lichess-org/chess-openings` CC0) ou do Augusto. Não usar código ou arte GPL no front (o `chessground` foi descartado por isso); o Stockfish só roda isolado em Web Worker, com aviso de licença em `/creditos`.
11. Não ligar pagamento em modo real sem confirmação explícita do Augusto.

## Estilo de código
- TypeScript estrito; sem `any` sem justificativa.
- Lógica pura (rating, revisão espaçada, ciclos, validação de lances, árvore de aberturas) em `src/lib/` com testes em Vitest.
- Componentes pequenos; tokens de cor e fontes definidos uma vez (Tailwind theme), nunca valores soltos repetidos.
- Fuso padrão para datas de negócio: `America/Sao_Paulo`.
- Textos da interface em português do Brasil. Placeholders entre colchetes (`[...]`) bloqueiam o deploy de produção. **Exceção temporária:** desde 2026-10-09 a produção tem `ALLOW_PLACEHOLDERS=1` na Vercel (decisão do Augusto, para ver a Finale em construção). Remover antes de abrir para alunos.
- Animações respeitam `prefers-reduced-motion`.

## Fluxo de trabalho
- Trabalhar por fases (ver `PROMPT_MESTRE.md`, seção 10). Ao final de cada fase: lint, testes, build, preview na Vercel, resumo e parar para validação.
- Cada fase numa branch própria; `main` é a produção.
- Commits pequenos, mensagens em português no imperativo.
- Dúvida de produto: perguntar uma vez, com recomendação. Não inventar regra de negócio.

## Onde está cada coisa
- Schema e RLS: `supabase/migrations/` (0001 a 0008 aplicadas)
- Pagamento: Asaas, webhook em `/api/pagamentos/asaas` (token no header `asaas-access-token`, idempotência em `payment_events`)
- Painel admin: `/admin` (só quem está na tabela `admins`)
- Vercel: projeto `finale-xadrez` (time sergio-codes), produção em https://finale-xadrez.vercel.app (o antigo academia-augusto-chess.vercel.app redireciona)
- Peças do tabuleiro: `public/pieces/cburnett/` (licença BSD)
- Desenhos antigos da Augusto Chess (referência histórica de layout): `docs/design/`
- Script de importação do Lichess: `scripts/import-lichess-puzzles.ts` (Fase 2)
- Next.js 16: `middleware.ts` virou `src/proxy.ts`; consultar `node_modules/next/dist/docs/` antes de usar APIs do Next. @AGENTS.md
