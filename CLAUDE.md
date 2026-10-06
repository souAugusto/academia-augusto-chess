# CLAUDE.md: Academia Augusto Chess

Site de assinatura de xadrez (Membro R$ 19/mês, Intensivo R$ 119/mês com turma de 10). Detalhes completos em `PROMPT_MESTRE.md`. Em caso de conflito, o `PROMPT_MESTRE.md` manda.

## Stack
Next.js (App Router) + TypeScript + Tailwind · Supabase (Auth, Postgres, RLS, `@supabase/ssr`) · Stripe · chessground + chess.js · Vercel · Vitest.

## Comandos
- `npm run dev`: servidor local
- `npm run lint` e `npm run test`: rodar antes de cada entrega
- `npm run build`: precisa passar antes de qualquer deploy
- `supabase db push`: aplica migrations (pedir confirmação antes de rodar contra o projeto de produção)

## Regras que nunca quebram
1. Nunca colocar chave, senha ou token no código ou no Git. Só variáveis de ambiente. `SUPABASE_SERVICE_ROLE_KEY` e chaves do Stripe nunca com prefixo `NEXT_PUBLIC_`.
2. Toda tabela nova nasce com RLS ligado e policies. Mudanças de banco só por migration em `supabase/migrations/`, numeradas.
3. Acesso por plano é checado no servidor. Esconder botão no front não conta como proteção.
4. Escritas em `subscriptions`, `seat_reservations`, `stripe_events` só pelo servidor com a service role.
5. Webhook do Stripe: verificar assinatura com o corpo bruto e garantir idempotência.
6. Validar toda entrada no servidor (Zod). Não confiar em `user_id` ou `plan` vindos do cliente.
7. Não existe plano gratuito. Não criar fluxo "grátis". O puzzle do dia é a única parte pública jogável.
8. Não prometer resultado (ex.: "suba X pontos de rating") em nenhum texto.
9. Nada do mestre convidado (nome, foto, currículo) aparece no site até o Augusto liberar.
10. Não copiar puzzles ou textos de livros/cursos de terceiros. Usar o banco de puzzles do Lichess (CC0) e conteúdo do Augusto. Verificar a licença das peças do tabuleiro.
11. Não ligar o Stripe em modo ao vivo sem confirmação explícita do Augusto.

## Estilo de código
- TypeScript estrito; sem `any` sem justificativa.
- Lógica pura (revisão espaçada, ciclos, validação de lances) em `src/lib/` com testes em Vitest.
- Componentes pequenos; tokens de cor e fontes definidos uma vez (Tailwind theme), nunca valores soltos repetidos.
- Fuso padrão para datas de negócio: `America/Sao_Paulo`.
- Textos da interface em português do Brasil. Placeholders entre colchetes (`[...]`) bloqueiam o deploy de produção.

## Fluxo de trabalho
- Trabalhar por fases (ver `PROMPT_MESTRE.md`, seção 9). Ao final de cada fase: lint, testes, build, preview na Vercel, resumo e parar para validação.
- Commits pequenos, mensagens em português no imperativo.
- Dúvida de produto: perguntar uma vez, com recomendação. Não inventar regra de negócio.

## Onde está cada coisa
- Design de referência: `docs/design/`
- Schema e RLS: `supabase/migrations/0001_init.sql`
- Script de importação do Lichess: `scripts/import-lichess-puzzles.ts` (fase 2)
- Next.js 16: `middleware.ts` virou `src/proxy.ts`; consultar `node_modules/next/dist/docs/` antes de usar APIs do Next. @AGENTS.md
